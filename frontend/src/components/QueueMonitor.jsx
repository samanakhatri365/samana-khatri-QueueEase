import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getMyTokens, getQueueStatus } from '../services/api';

/**
 * Global Queue Monitor - Listens for queue updates and pushes notifications
 * Runs at the App level so notifications work on ANY page
 */
const QueueMonitor = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const location = useLocation();

    const socketRef = useRef(null);
    const positionsRef = useRef({}); // { tokenId: position }
    const audioRef = useRef(null);
    const isConnectedRef = useRef(false);
    const monitoredDeptsRef = useRef(new Set());
    const lastSyncRef = useRef(0);

    // Initialize audio on mount
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Function to handle a queue update event
    const handleQueueUpdate = useCallback(async (data) => {
        if (!user || user.role !== 'patient') return;

        try {
            // Get fresh tokens periodically or on update
            const { data: tokensData } = await getMyTokens();
            const activeTokens = (tokensData.tokens || []).filter(t =>
                t.status === 'waiting' || t.status === 'serving'
            );

            // Find tokens affected by this department update
            const myAffectedTokens = activeTokens.filter(t =>
                (t.department?._id || t.department) === data.departmentId
            );

            if (myAffectedTokens.length === 0) return;

            for (const myToken of myAffectedTokens) {
                const safeWaiting = Array.isArray(data.waiting) ? data.waiting : [];
                const isNowServing = (data.currentServing?._id === myToken._id || data.serving?._id === myToken._id);

                const prevPosition = positionsRef.current[myToken._id];
                let newPosition;

                if (isNowServing) {
                    newPosition = 0;
                } else {
                    const pos = safeWaiting.findIndex(t => t._id === myToken._id);
                    newPosition = pos !== -1 ? pos + 1 : null;
                }

                if (newPosition === null) continue;

                // Notify only if position actually improved (decreased) or first time seeing token
                if (prevPosition === undefined || prevPosition > newPosition) {
                    const peopleAhead = newPosition - 1;

                    if (newPosition === 0) {
                        addNotification(`🎉 Your turn has arrived! Get in fast! (Token #${myToken.tokenNumber})`, 'success');
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play().catch(() => { });
                        }
                    } else if (newPosition === 1) {
                        addNotification(`⚡ You're next in line! Get ready! (Token #${myToken.tokenNumber})`, 'warning');
                    } else if (newPosition <= 5) {
                        // Only notify for small positions to avoid spam
                        addNotification(`🔔 Your turn is after ${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} (Token #${myToken.tokenNumber})`, 'info');
                    }

                    positionsRef.current[myToken._id] = newPosition;
                } else if (prevPosition < newPosition) {
                    // Position worsened (unlikely but track it)
                    positionsRef.current[myToken._id] = newPosition;
                }
            }
        } catch (error) {
            console.error('[QueueMonitor] Update Error:', error);
        }
    }, [user, addNotification]);

    // Function to sync tokens and join rooms
    const syncRooms = useCallback(async () => {
        if (!user || user.role !== 'patient' || !socketRef.current) return;

        // Rate limit sync
        const now = Date.now();
        if (now - lastSyncRef.current < 2000) return;
        lastSyncRef.current = now;

        try {
            const { data } = await getMyTokens();
            const activeTokens = (data.tokens || []).filter(t =>
                t.status === 'waiting' || t.status === 'serving'
            );

            const currentDepts = new Set(activeTokens.map(t => t.department?._id || t.department));

            // Join new rooms
            currentDepts.forEach(deptId => {
                if (!monitoredDeptsRef.current.has(deptId)) {
                    socketRef.current.emit('join-department', deptId);
                    monitoredDeptsRef.current.add(deptId);
                    console.log(`[QueueMonitor] Joined new room: ${deptId}`);
                }
            });

            // Re-initialize positions for any new tokens
            for (const token of activeTokens) {
                if (positionsRef.current[token._id] === undefined) {
                    try {
                        const { data: status } = await getQueueStatus(token.department?._id || token.department);
                        const waiting = Array.isArray(status.waiting) ? status.waiting : [];
                        if (token.status === 'serving') {
                            positionsRef.current[token._id] = 0;
                        } else {
                            const pos = waiting.findIndex(t => t._id === token._id);
                            positionsRef.current[token._id] = pos !== -1 ? pos + 1 : token.tokenNumber;
                        }
                    } catch (e) { }
                }
            }
        } catch (error) {
            console.error('[QueueMonitor] Sync Error:', error);
        }
    }, [user]);

    // Use a ref for the handler to keep the socket effect stable
    const updateHandlerRef = useRef(handleQueueUpdate);
    useEffect(() => {
        updateHandlerRef.current = handleQueueUpdate;
    }, [handleQueueUpdate]);

    // Socket Lifecycle
    useEffect(() => {
        if (!user || user.role !== 'patient') return;

        console.log('[QueueMonitor] Initializing socket connection...');
        socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            isConnectedRef.current = true;
            monitoredDeptsRef.current.clear(); // Re-join rooms on reconnect
            syncRooms();
        });

        socket.on('disconnect', () => {
            isConnectedRef.current = false;
        });

        socket.on('queue-updated', (data) => {
            if (updateHandlerRef.current) {
                updateHandlerRef.current(data);
            }
        });

        const interval = setInterval(syncRooms, 15000); // Sync tokens every 15s

        return () => {
            clearInterval(interval);
            socket.off('queue-updated');
            socket.disconnect();
        };
    }, [user, syncRooms]); // Removed handleQueueUpdate from dependencies

    // Re-sync on route changes (catches new bookings immediately)
    useEffect(() => {
        syncRooms();
    }, [location.pathname, syncRooms]);

    return null;
};

export default QueueMonitor;
