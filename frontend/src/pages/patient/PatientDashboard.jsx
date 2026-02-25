import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, LogOut, Search, Activity, Clock,
    ChevronRight, Loader2, User as UserIcon, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDepartments, generateToken, getDoctorsByDepartment } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Doctor Selection States
    const [selectedDept, setSelectedDept] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [isFetchingDoctors, setIsFetchingDoctors] = useState(false);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const { data } = await getDepartments();
                setDepartments(data.departments || []);
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const fetchDoctors = async (deptId) => {
        setIsFetchingDoctors(true);
        try {
            const { data } = await getDoctorsByDepartment(deptId);
            setDoctors(data.doctors || []);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        } finally {
            setIsFetchingDoctors(false);
        }
    };

    const handleSelectDept = (dept) => {
        setSelectedDept(dept);
        fetchDoctors(dept._id || dept.id);
    };

    const handleJoinQueue = async (doctorId) => {
        if (!selectedDept || !doctorId) return;
        setIsJoining(doctorId);
        try {
            const { data } = await generateToken(selectedDept._id || selectedDept.id, doctorId);
            navigate(`/queue/${data.token._id}`);
        } catch (error) {
            console.error("Failed to join queue:", error);
            alert(error.response?.data?.message || "Failed to join queue");
        } finally {
            setIsJoining(null);
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center gap-2">
                    <Activity className="text-primary w-6 h-6" />
                    <span className="text-xl font-bold italic text-slate-900">QueueEase</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/my-queues')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        <Clock className="w-5 h-5" />
                        My Queues
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name || 'Patient'}</h1>
                        <p className="text-slate-500">Pick a department and select your doctor</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                placeholder="Search departments..."
                            />
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-slate-400 font-medium animate-pulse">Fetching departments...</p>
                    </div>
                ) : (
                    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDepartments.map(dept => (
                            <div key={dept._id || dept.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Wait Time</div>
                                        <div className="text-lg font-black text-slate-900">{dept.estimatedWaitTime || '0'}m</div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">
                                    {dept.description || "Healthcare experts ready to assist you. Join the digital queue for instant tracking."}
                                </p>
                                <button
                                    onClick={() => handleSelectDept(dept)}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
                                >
                                    Book Token
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </section>
                )}
            </main>

            {/* Doctor Selection Modal */}
            {selectedDept && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedDept(null)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>

                        <div className="mb-8">
                            <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-widest">Step 2: select doctor</span>
                            <h2 className="text-2xl font-black text-slate-900 mt-4">{selectedDept.name}</h2>
                            <p className="text-slate-500 text-sm mt-1">Available healthcare providers</p>
                        </div>

                        {isFetchingDoctors ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : doctors.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <UserIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">No doctors currently active</p>
                                <button onClick={() => setSelectedDept(null)} className="text-primary text-sm font-bold mt-2">Pick another department</button>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {doctors.map(doc => (
                                    <button
                                        key={doc._id}
                                        onClick={() => handleJoinQueue(doc._id)}
                                        disabled={isJoining === doc._id}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary/5 transition-colors">
                                                <UserIcon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">Dr. {doc.name}</div>
                                                <div className="text-xs text-slate-400">Consultant</div>
                                            </div>
                                        </div>
                                        {isJoining === doc._id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
