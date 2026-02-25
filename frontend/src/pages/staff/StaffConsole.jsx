import React, { useState, useEffect } from 'react';
import {
    Play, SkipForward, Users, Activity, LogOut,
    CheckCircle2, Loader2, AlertCircle, Moon, Sun, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getDepartmentQueue, callNextToken, skipToken,
    getDepartments, completeToken, toggleAvailability
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const StaffConsole = () => {
    const { user, logout, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [currentlyServing, setCurrentlyServing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState(user?.departmentId?._id || user?.departmentId || null);
    const [departments, setDepartments] = useState([]);
    const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const { data } = await getDepartments();
                const depts = data.departments || [];
                setDepartments(depts);
                if (!selectedDeptId && depts.length > 0) {
                    setSelectedDeptId(depts[0]._id || depts[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            }
        };
        fetchDepts();
    }, [selectedDeptId, user]);

    useEffect(() => {
        if (!selectedDeptId) return;

        const fetchQueue = async () => {
            setIsLoading(true);
            try {
                const { data } = await getDepartmentQueue(selectedDeptId);
                setQueue(data.waiting || []);
                setCurrentlyServing(data.currentServing || data.serving || null);
            } catch (error) {
                console.error("Failed to fetch queue:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQueue();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socket.emit('join-department', selectedDeptId);

        socket.on('queue-updated', (data) => {
            if (data.departmentId === selectedDeptId) {
                setQueue(data.waiting);
                setCurrentlyServing(data.currentServing || data.serving);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [selectedDeptId]);

    const handleToggleAvailability = async () => {
        try {
            const { data } = await toggleAvailability();
            setIsAvailable(data.isAvailable);
            checkAuth(); // Update global user state
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        }
    };

    const handleCallNext = async () => {
        if (!selectedDeptId) return;
        setIsActionLoading(true);
        try {
            console.log("Calling next token for dept:", selectedDeptId);
            const { data } = await callNextToken(selectedDeptId);
            console.log("Next token data:", data);
            setCurrentlyServing(data.currentServing);
        } catch (error) {
            console.error("Failed to call next patient:", error);
            alert(error.response?.data?.message || "No patients in queue");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleComplete = async () => {
        console.log("Marking done. Currently Serving:", currentlyServing);
        if (!currentlyServing) return;

        setIsActionLoading(true);
        try {
            const tokenId = currentlyServing._id || currentlyServing.id;
            console.log("Completing Token ID:", tokenId);
            await completeToken(tokenId);
            setCurrentlyServing(null);
            console.log("Token completed successfully");
        } catch (error) {
            console.error("Failed to complete token:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSkip = async () => {
        console.log("Skipping. Currently Serving:", currentlyServing);
        if (!currentlyServing) return;

        setIsActionLoading(true);
        try {
            const tokenId = currentlyServing._id || currentlyServing.id;
            console.log("Skipping Token ID:", tokenId);
            await skipToken(tokenId);
            setCurrentlyServing(null);
            console.log("Token skipped successfully");
        } catch (error) {
            console.error("Failed to skip token:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const currentDeptName = departments.find(d => (d._id || d.id) === selectedDeptId)?.name || "Select Department";

    return (
        <div className="min-h-screen bg-slate-900 text-white flex select-none">
            {/* Dark Sidebar */}
            <aside className="w-72 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col">
                <div className="p-8 border-b border-slate-800 flex items-center gap-2">
                    <Activity className="text-primary w-8 h-8" />
                    <span className="text-2xl font-black italic tracking-tighter">QueueEase</span>
                </div>

                <div className="p-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Identity & Status</div>
                    <div className="p-4 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                                {user?.name?.[0] || 'D'}
                            </div>
                            <div>
                                <div className="font-black text-white">Dr. {user?.name || 'Staff'}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Medical Officer</div>
                            </div>
                        </div>

                        <button
                            onClick={handleToggleAvailability}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${isAvailable ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                        >
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                                {isAvailable ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {isAvailable ? 'Active' : 'On Leave'}
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${isAvailable ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isAvailable ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="px-6 mb-8">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Switch Department</label>
                    <div className="relative group">
                        <select
                            value={selectedDeptId || ''}
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all hover:border-slate-700"
                        >
                            {departments.map(d => (
                                <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors text-slate-500">▼</div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Activity className="w-4 h-4" />
                        Live Console
                    </button>
                    <button
                        onClick={() => navigate('/staff-history')}
                        className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <Users className="w-4 h-4" />
                        Queue History
                    </button>
                </nav>

                <div className="p-6">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900 to-slate-900">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Live Department Hub</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">{currentDeptName}</h1>
                        <p className="text-slate-400 font-medium">Monitoring patients and queue efficiency</p>
                    </div>

                    <div className="flex items-center gap-8 bg-slate-950/50 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Waiting</div>
                            <div className="text-2xl font-black text-primary">{queue.length}</div>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Consulted</div>
                            <div className="text-2xl font-black text-emerald-500">{user?.stats?.servedCount || 0}</div>
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Syncing Master Queue...</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-5 gap-8 items-start">
                        {/* Currently Serving - Hero Section */}
                        <div className="lg:col-span-3">
                            <div className="bg-slate-950/50 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group min-h-[500px] flex flex-col justify-center items-center text-center">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Patient In Session</div>

                                {currentlyServing ? (
                                    <>
                                        <div className="text-[10rem] font-black text-white leading-none tracking-tighter mb-4 drop-shadow-2xl">
                                            {currentlyServing.tokenNumber}
                                        </div>
                                        <div className="text-2xl text-slate-400 font-bold mb-12 flex items-center gap-3">
                                            <UserIcon className="w-6 h-6" />
                                            {currentlyServing.patient?.name || 'Authorized Patient'}
                                        </div>

                                        <div className="flex gap-4 w-full max-w-md">
                                            <button
                                                onClick={handleComplete}
                                                disabled={isActionLoading}
                                                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 disabled:opacity-50 active:scale-95"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                MARK DONE
                                            </button>
                                            <button
                                                onClick={handleSkip}
                                                disabled={isActionLoading}
                                                className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest text-xs rounded-[2rem] transition-all flex items-center justify-center gap-3 border border-slate-700 disabled:opacity-50 active:scale-95"
                                            >
                                                <SkipForward className="w-5 h-5" />
                                                SKIP PATIENT
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-8">
                                            <AlertCircle className="w-10 h-10 text-slate-700" />
                                        </div>
                                        <p className="text-slate-500 font-bold text-lg mb-12 uppercase tracking-widest">Master Console Idle</p>
                                        <button
                                            onClick={handleCallNext}
                                            disabled={isActionLoading || queue.length === 0}
                                            className="px-12 py-6 bg-primary hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-[2.5rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 disabled:opacity-20 active:scale-95"
                                        >
                                            <Play className="w-6 h-6" />
                                            Call Next Patient
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Waiting List Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-950/50 rounded-[3rem] border border-slate-800 p-8 shadow-xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em]">Up Next</h2>
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20">
                                        {queue.length} IN LINE
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                                    {queue.map((token, index) => (
                                        <div key={token._id || token.id} className="flex justify-between items-center p-5 bg-slate-900/50 rounded-2xl border border-slate-800 group hover:border-primary/50 hover:bg-slate-900 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-slate-950 text-slate-600 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                    {token.tokenNumber}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200 group-hover:text-white">{token.patient?.name || 'Patient'}</div>
                                                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Wait Time: {index * 5}m</div>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <button
                                                    onClick={() => handleCallNext()}
                                                    disabled={isActionLoading}
                                                    className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-xl transition-all shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {queue.length === 0 && (
                                        <div className="text-center py-20">
                                            <Users className="w-12 h-12 mx-auto mb-4 text-slate-800" />
                                            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No pending tickets</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Help / Activity */}
                            <div className="bg-emerald-600/10 p-8 rounded-[2.5rem] border border-emerald-500/20">
                                <Activity className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="text-lg font-black mb-2 text-emerald-500 uppercase tracking-tighter">Support & Analytics</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">View detailed department performance metrics and patient turnaround times in the history portal.</p>
                                <button
                                    onClick={() => navigate('/staff-history')}
                                    className="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    OPEN HISTORY PORTAL
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StaffConsole;
