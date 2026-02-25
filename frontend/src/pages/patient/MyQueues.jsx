import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, ArrowLeft, Loader2, ChevronRight, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyTokens } from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

const MyQueues = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const { data } = await getMyTokens();
                setTokens(data.tokens || []);
            } catch (error) {
                console.error("Failed to fetch tokens:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTokens();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'waiting': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'serving': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 animate-pulse';
            case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200';
            case 'skipped': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'waiting': return <Timer className="w-4 h-4" />;
            case 'serving': return <Activity className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'skipped': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Queues</h1>
                        <p className="text-slate-500">Track your active hospital visits and history</p>
                    </div>
                    <div className="ml-auto">
                        <NotificationBell />
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="font-medium">Fetching your tokens...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tokens.length > 0 ? (
                            tokens.map(token => (
                                <div
                                    key={token._id || token.id}
                                    onClick={() => (token.status === 'waiting' || token.status === 'serving') && navigate(`/queue/${token.tokenNumber}`)}
                                    className={`bg-white p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${token.status === 'serving' ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100 hover:shadow-md'
                                        } ${(token.status === 'waiting' || token.status === 'serving') ? 'cursor-pointer' : 'opacity-75'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic">
                                            #{token.tokenNumber}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{token.department?.name || 'Department'}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                                <Clock className="w-4 h-4" />
                                                Joined on {token.date}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusStyle(token.status)}`}>
                                            {getStatusIcon(token.status)}
                                            {token.status}
                                        </span>
                                        {(token.status === 'waiting' || token.status === 'serving') && (
                                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-primary transition-colors">
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center">
                                <Clock className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No active tokens</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">You haven't joined any queues today. Head back to the dashboard to get started.</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
                                >
                                    View Departments
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyQueues;
