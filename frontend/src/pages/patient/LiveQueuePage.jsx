import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Activity, Clock, Users, ArrowLeft,
    Loader2, User as UserIcon, ChevronRight
} from 'lucide-react';
import { getQueueStatus, getMyTokens, checkFeedback } from '../../services/api';
import { io } from 'socket.io-client';
import FeedbackModal from '../../components/FeedbackModal';

const LiveQueuePage = () => {
    const { tokenID } = useParams();
    const [token, setToken] = useState(null);
    const [queueStatus, setQueueStatus] = useState({ waiting: [], serving: null });
    const [isLoading, setIsLoading] = useState(true);
    const [myPosition, setMyPosition] = useState(0);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [hasFeedback, setHasFeedback] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getMyTokens();
                const myTokens = data.tokens || [];
                const foundToken = myTokens.find(t => t.tokenNumber === parseInt(tokenID) || t._id === tokenID);

                if (foundToken) {
                    setToken(foundToken);
                    const { data: status } = await getQueueStatus(foundToken.department?._id || foundToken.department);

                    const safeStatus = {
                        waiting: Array.isArray(status.waiting) ? status.waiting : [],
                        serving: status.currentServing || status.serving || null
                    };
                    setQueueStatus(safeStatus);

                    if (foundToken.status === 'serving') {
                        setMyPosition(0);
                    } else if (foundToken.status === 'completed') {
                        setMyPosition(-1);
                        // Check if feedback already given
                        try {
                            const { data: fbData } = await checkFeedback(foundToken._id);
                            setHasFeedback(fbData.hasFeedback);
                            if (fbData.canSubmit) {
                                setShowFeedbackModal(true);
                            }
                        } catch (e) {
                            console.log('Feedback check skipped');
                        }
                    } else {
                        const pos = safeStatus.waiting.findIndex(t => t._id === foundToken._id);
                        setMyPosition(pos !== -1 ? pos + 1 : foundToken.tokenNumber || 1);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch queue status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        if (token) {
            socket.emit('join-department', token.department?._id || token.department);
        }

        // Socket listener for UI updates only (notifications handled by QueueMonitor)
        socket.on('queue-updated', (data) => {
            if (token && data.departmentId === (token.department?._id || token.department)) {
                const safeWaiting = Array.isArray(data.waiting) ? data.waiting : [];

                setQueueStatus({
                    waiting: safeWaiting,
                    serving: data.currentServing || data.serving || null
                });

                const isNowServing = (data.currentServing?._id === token._id || data.serving?._id === token._id);

                if (isNowServing) {
                    setMyPosition(0);
                    setToken(prev => ({ ...prev, status: 'serving' }));
                } else {
                    const pos = safeWaiting.findIndex(t => t._id === token._id);
                    if (pos !== -1) {
                        setMyPosition(pos + 1);
                        setToken(prev => ({ ...prev, status: 'waiting' }));
                    } else if (!safeWaiting.find(t => t._id === token._id) && 
                               data.currentServing?._id !== token._id &&
                               data.serving?._id !== token._id) {
                        // Token not in waiting and not serving - might be completed
                        setToken(prev => ({ ...prev, status: 'completed' }));
                        setMyPosition(-1);
                        if (!hasFeedback) {
                            setShowFeedbackModal(true);
                        }
                    }
                }
            }
        });

        return () => socket.disconnect();
    }, [tokenID, token?._id, token?.department]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Live Queue...</p>
            </div>
        );
    }

    const estimatedWait = myPosition > 0 ? `${myPosition * 5}m` : '0m';
    const isServing = myPosition === 0 && token?.status === 'serving';
    const isCompleted = myPosition === -1 || token?.status === 'completed';
    const isNext = myPosition === 1;
    const isYellowAlert = myPosition > 1 && myPosition <= 3;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false);
                    setHasFeedback(true);
                }}
                tokenId={token?._id}
                doctorName={token?.doctor?.name}
                departmentName={token?.department?.name}
            />

            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all mb-8 font-bold text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BACK TO DASHBOARD
                </Link>

                <div className="grid md:grid-cols-5 gap-8 items-start">
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="bg-slate-900 p-8 text-center text-white relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-slate-50 rounded-b-3xl"></div>
                                <div className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2">QueueEase Digital Ticket</div>
                                <h1 className="text-4xl font-black mb-1">{token?.department?.name}</h1>
                                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Verified Slot • {token?.date}</p>
                            </div>

                            <div className="p-10 text-center">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Your Token Number</div>
                                <div className="text-9xl font-black text-slate-900 mb-8 tracking-tighter tabular-nums drop-shadow-sm">
                                    {token?.tokenNumber}
                                </div>

                                <div className="flex items-center justify-center gap-3 mb-10 py-4 px-6 bg-slate-50 rounded-2xl w-full">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Consulting Doctor</div>
                                        <div className="font-bold text-slate-700">Dr. {token?.doctor?.name || 'Assigned Specialist'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-10 border-t-2 border-dashed border-slate-100 relative">
                                    <div className="absolute -left-14 -top-3 w-8 h-8 bg-slate-50 rounded-full"></div>
                                    <div className="absolute -right-14 -top-3 w-8 h-8 bg-slate-50 rounded-full"></div>

                                    <div>
                                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Queue Position</div>
                                        <div className="text-3xl font-black text-slate-900">
                                            {isCompleted ? 'DONE' : (isServing ? 'SERVING' : `#${myPosition}`)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Est. Wait</div>
                                        <div className="text-3xl font-black text-primary">~{estimatedWait}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 flex justify-center">
                                <div className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden grayscale opacity-20">
                                    <div className="w-[120%] flex gap-2">
                                        {[...Array(20)].map((_, i) => <div key={i} className="min-w-[12px] h-6 bg-slate-400 rounded-sm"></div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                LIVE TRACKER
                            </h2>
                            <div className="space-y-4">
                                {queueStatus.serving ? (
                                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-100 rounded-full opacity-50"></div>
                                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2">Now In Room</div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="text-2xl font-black text-emerald-700">#{queueStatus.serving.tokenNumber}</div>
                                                <div className="text-xs font-bold text-emerald-600 truncate max-w-[120px]">
                                                    {queueStatus.serving.patient?.name || 'Current Patient'}
                                                </div>
                                            </div>
                                            <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden opacity-50">
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Now In Room</div>
                                        <div className="text-lg font-bold text-slate-500 italic">Waiting...</div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        Next In Line
                                    </div>
                                    <div className="space-y-2">
                                        {queueStatus.waiting.length > 0 ? (
                                            queueStatus.waiting.slice(0, 5).map((t, idx) => (
                                                <div
                                                    key={t._id}
                                                    className={`p-3 rounded-xl flex items-center justify-between transition-all border ${t._id === token?._id
                                                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                            : 'bg-white border-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${t._id === token?._id ? 'bg-white/20' : 'bg-slate-100'}`}>
                                                            {t.tokenNumber}
                                                        </div>
                                                        <span className="font-bold text-xs">
                                                            {t._id === token?._id ? 'You' : (idx === 0 ? 'Next' : `Token #${t.tokenNumber}`)}
                                                        </span>
                                                    </div>
                                                    {t._id === token?._id && <div className="text-[8px] font-black uppercase tracking-tighter bg-white/20 px-2 py-0.5 rounded-full">Your Spot</div>}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Queue is empty</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {queueStatus.waiting.length > 5 && (
                                    <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest pt-1">
                                        + {queueStatus.waiting.length - 5} others waiting
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Clock className="w-20 h-20" />
                            </div>
                            <h3 className="text-xl font-black mb-3 leading-tight pt-4">Stay Notified</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                Keep this tab open to receive audio alerts and live updates. We'll ring a bell when your turn arrives.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveQueuePage;
