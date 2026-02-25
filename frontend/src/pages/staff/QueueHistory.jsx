import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2, SkipForward, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQueueHistory, getDepartments } from '../../services/api';

const QueueHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDeptId, setSelectedDeptId] = useState(user?.departmentId || null);
    const [departments, setDepartments] = useState([]);

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

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const { data } = await getQueueHistory(selectedDeptId, { limit: 100 });
                setHistory(data.tokens || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [selectedDeptId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'skipped': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'skipped': return <SkipForward className="w-4 h-4" />;
            case 'cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/staff-console')}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Queue History</h1>
                            <p className="text-slate-400">Review past patient interactions and skipped tokens</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-1.5 rounded-2xl border border-slate-700 flex items-center">
                            <label className="px-4 text-xs font-bold text-slate-500 uppercase">Clinic</label>
                            <select
                                value={selectedDeptId || ''}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                                className="bg-slate-900 border-none rounded-xl py-2 px-4 text-sm font-bold focus:ring-0 cursor-pointer"
                            >
                                {departments.map(d => (
                                    <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="font-medium">Loading history...</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/30 rounded-[2.5rem] border border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-8 py-6">Token</th>
                                        <th className="px-8 py-6">Patient Details</th>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Time Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {history.map((token) => (
                                        <tr key={token._id || token.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-primary border border-slate-700">
                                                    #{token.tokenNumber}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-100">{token.patient?.name || 'Walk-in Patient'}</div>
                                                <div className="text-xs text-slate-500">{token.patient?.email || 'No email provided'}</div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-600" />
                                                    {token.date}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(token.status)}`}>
                                                    {getStatusIcon(token.status)}
                                                    {token.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-medium">
                                                {token.calledAt && (
                                                    <div className="text-slate-400 mb-1">Called: {new Date(token.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                )}
                                                {token.completedAt && (
                                                    <div className="text-emerald-500/80">Done: {new Date(token.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                )}
                                                {!token.calledAt && <span className="text-slate-600 italic">No time data</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {history.length === 0 && (
                            <div className="text-center py-20">
                                <Clock className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                                <p className="text-slate-500 font-medium">No history found for this department</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueueHistory;
