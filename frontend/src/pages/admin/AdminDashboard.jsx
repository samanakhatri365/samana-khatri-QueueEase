import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, BarChart3, Users, Hospital, Activity, LogOut, Plus, RefreshCw, Trash2, Edit, Loader2, MessageSquare, Download, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { seedDepartments, getDepartments, getStaff, createStaff, addDepartment, resetQueue, getDailyAnalytics, getSystemConfig, updateSystemConfig } from '../../services/api';
import { io } from 'socket.io-client';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell
} from 'recharts';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');
    const [departments, setDepartments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    // Use API data for hourly chart, fallback to mock data
    const hourlyData = analyticsData?.hourlyData?.length > 0 
        ? analyticsData.hourlyData.map(h => ({ time: h.hour, patients: h.tokens }))
        : [
            { time: '08:00', patients: 0 },
            { time: '10:00', patients: 0 },
            { time: '12:00', patients: 0 },
            { time: '14:00', patients: 0 },
            { time: '16:00', patients: 0 },
            { time: '18:00', patients: 0 },
        ];

    const deptChartData = departments.map(d => ({
        name: d.name,
        count: d.currentToken || 0
    }));

    // Form states
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', departmentId: '' });

    // System Configuration State
    const [systemConfig, setSystemConfig] = useState({
        hospitalName: '',
        email: '',
        phone: '',
        address: '',
        tokenPrefix: 'Q-',
        maxQueueSize: 50,
        tokenTimeoutMins: 30,
        avgConsultationTime: 15,
        weekdayOpen: '09:00',
        weekdayClose: '17:00',
        weekendOpen: '10:00',
        weekendClose: '14:00'
    });
    const [configLoading, setConfigLoading] = useState(false);

    // Fetch System Config
    const fetchSystemConfig = async () => {
        try {
            const res = await getSystemConfig();
            setSystemConfig(res.data);
        } catch (error) {
            console.log('Failed to load system config:', error);
        }
    };

    // Handle config input change
    const handleConfigChange = (field, value) => {
        setSystemConfig(prev => ({ ...prev, [field]: value }));
    };

    // Save System Config
    const handleSaveConfig = async () => {
        setConfigLoading(true);
        try {
            await updateSystemConfig(systemConfig);
            alert('✅ Configuration saved successfully!');
        } catch (error) {
            alert('❌ Failed to save configuration: ' + (error.response?.data?.message || error.message));
        } finally {
            setConfigLoading(false);
        }
    };

    // Reset Config to last saved values
    const handleResetConfig = async () => {
        if (window.confirm('Reset to last saved values?')) {
            await fetchSystemConfig();
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [deptRes, staffRes] = await Promise.allSettled([
                getDepartments(),
                getStaff()
            ]);

            if (deptRes.status === 'fulfilled') {
                setDepartments(deptRes.value.data.departments || []);
            }
            if (staffRes.status === 'fulfilled') {
                setStaff(staffRes.value.data.staff || []);
            }

            // Fetch analytics data from API
            try {
                const analyticsRes = await getDailyAnalytics();
                setAnalyticsData(analyticsRes.data);
            } catch (err) {
                console.log('Analytics fetch skipped:', err);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchSystemConfig();

        // Real-time updates for Admin (Trello Requirement)
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');


        return () => socket.disconnect();
    }, []);

    const handleAddDept = async (e) => {
        e.preventDefault();
        try {
            await addDepartment(newDept);
            setShowDeptModal(false);
            setNewDept({ name: '', code: '', description: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add department");
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await createStaff(newStaff);
            setShowStaffModal(false);
            setNewStaff({ name: '', email: '', password: '', departmentId: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add staff");
        }
    };

    const handleResetQueue = async (deptId) => {
        if (!window.confirm("Are you sure you want to reset the queue for this department?")) return;
        try {
            await resetQueue(deptId);
            alert("Queue reset successfully");
            await fetchData();
        } catch (error) {
            alert("Failed to reset queue");
        }
    };

    // CSV Export Function
    const exportToCSV = () => {
        if (!analyticsData) {
            alert('No analytics data available to export');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "QueueEase Daily Analytics Report\n";
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Summary Stats
        csvContent += "SUMMARY\n";
        csvContent += `Total Patients Served,${analyticsData.totalServed || 0}\n`;
        csvContent += `Average Wait Time (mins),${analyticsData.avgWaitTime || 0}\n\n`;

        // Doctor Breakdown
        if (analyticsData.doctorBreakdown && analyticsData.doctorBreakdown.length > 0) {
            csvContent += "DOCTOR PERFORMANCE\n";
            csvContent += "Doctor Name,Tokens Served\n";
            analyticsData.doctorBreakdown.forEach(row => {
                csvContent += `${row.name || 'Unknown'},${row.count}\n`;
            });
            csvContent += "\n";
        }

        // Department Breakdown
        if (analyticsData.departmentBreakdown && analyticsData.departmentBreakdown.length > 0) {
            csvContent += "DEPARTMENT PERFORMANCE\n";
            csvContent += "Department,Total Tokens\n";
            analyticsData.departmentBreakdown.forEach(row => {
                csvContent += `${row.departmentName || 'Unknown'},${row.count}\n`;
            });
            csvContent += "\n";
        }

        // Hourly breakdown
        if (analyticsData.hourlyData && analyticsData.hourlyData.length > 0) {
            csvContent += "HOURLY BREAKDOWN\n";
            csvContent += "Hour,Tokens\n";
            analyticsData.hourlyData.forEach(row => {
                csvContent += `${row.hour},${row.tokens}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = [
        { label: 'Total Patients Today', value: analyticsData?.totalServed?.toString() || '0', icon: Users, color: 'text-primary' },
        { label: 'Avg. Wait Time', value: `${analyticsData?.avgWaitTime || 0}m`, icon: Clock, color: 'text-secondary' },
        { label: 'Staff Online', value: staff.length.toString(), icon: Hospital, color: 'text-accent' },
        { label: 'Active Depts', value: departments.length.toString(), icon: BarChart3, color: 'text-red-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center gap-2">
                    <Activity className="text-primary w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight italic">QueueEase <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 not-italic">ADMIN</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'departments', label: 'Departments', icon: Hospital },
                        { id: 'staff', label: 'Staff Management', icon: Users },
                        { id: 'settings', label: 'System Config', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                    <Link
                        to="/admin/feedback"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-slate-600 hover:bg-slate-50"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Patient Feedback
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {activeTab === 'analytics' && "Hospital Analytics"}
                            {activeTab === 'departments' && "Department Management"}
                            {activeTab === 'staff' && "Staff & Doctors"}
                            {activeTab === 'settings' && "System Configuration"}
                        </h1>
                        <p className="text-slate-500">
                            {activeTab === 'analytics' && "Monitor hospital efficiency and patient flow"}
                            {activeTab === 'departments' && "Configure and manage clinic departments"}
                            {activeTab === 'staff' && "Manage healthcare providers and support staff"}
                            {activeTab === 'settings' && "Configure global system parameters"}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {activeTab === 'analytics' && (
                            <button
                                onClick={exportToCSV}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Download className="w-5 h-5" /> Export Report
                            </button>
                        )}
                        {activeTab === 'departments' && (
                            <button onClick={() => setShowDeptModal(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" /> Add Department
                            </button>
                        )}
                        {activeTab === 'staff' && (
                            <button onClick={() => setShowStaffModal(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" /> Add Staff
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                try {
                                    await seedDepartments();
                                    alert("Departments seeded successfully");
                                    fetchData();
                                } catch (error) { alert("Seed failed"); }
                            }}
                            className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" /> Seed Data
                        </button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {activeTab === 'analytics' && (
                            <>
                                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                    {stats.map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                            <div className={`p-3 rounded-2xl bg-slate-50 w-fit mb-4 ${item.color}`}>
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-slate-500 text-sm font-medium">{item.label}</div>
                                            <div className="text-3xl font-black text-slate-900">{item.value}</div>
                                        </div>
                                    ))}
                                </section>

                                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            Hourly Patient Flow
                                        </h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={hourlyData}>
                                                    <defs>
                                                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                                    />
                                                    <Area type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Hospital className="w-5 h-5 text-secondary" />
                                            Department Load
                                        </h3>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={deptChartData}>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ fill: '#f8fafc' }}
                                                    />
                                                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                        {deptChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'departments' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departments.map(dept => (
                                    <div key={dept._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-xl">
                                                {dept.code}
                                            </div>
                                            <button onClick={() => handleResetQueue(dept._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Reset Queue">
                                                <RefreshCw className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{dept.name}</h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">{dept.description || 'No description provided'}</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">Now Serving</div>
                                                <div className="text-xl font-black text-primary">#{dept.nowServing || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold text-right">Total Patients</div>
                                                <div className="text-xl font-black text-slate-900 text-right">{dept.currentToken || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'staff' && (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-4">Name</th>
                                            <th className="px-8 py-4">Email</th>
                                            <th className="px-8 py-4">Assigned Department</th>
                                            <th className="px-8 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {staff.map(s => (
                                            <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4 font-bold text-slate-900">{s.name}</td>
                                                <td className="px-8 py-4 text-slate-500">{s.email}</td>
                                                <td className="px-8 py-4">
                                                    <span className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full">
                                                        {s.departmentId?.name || "Unassigned"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 flex gap-2">
                                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                                                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Hospital Information */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Hospital className="w-5 h-5 text-primary" />
                                        Hospital Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Hospital Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., City General Hospital" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                value={systemConfig.hospitalName}
                                                onChange={(e) => handleConfigChange('hospitalName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Contact Email</label>
                                            <input 
                                                type="email" 
                                                placeholder="contact@hospital.com" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                value={systemConfig.email}
                                                onChange={(e) => handleConfigChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                placeholder="+1-XXX-XXX-XXXX" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                value={systemConfig.phone}
                                                onChange={(e) => handleConfigChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Address</label>
                                            <textarea 
                                                placeholder="Hospital address" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20"
                                                value={systemConfig.address}
                                                onChange={(e) => handleConfigChange('address', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Queue Settings */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-secondary" />
                                        Queue Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Token Prefix</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., Q-" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                                                maxLength="5"
                                                value={systemConfig.tokenPrefix}
                                                onChange={(e) => handleConfigChange('tokenPrefix', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Max Queue Size</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g., 50" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                                                min="1"
                                                value={systemConfig.maxQueueSize}
                                                onChange={(e) => handleConfigChange('maxQueueSize', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Token Timeout (minutes)</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g., 30" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                                                min="1"
                                                value={systemConfig.tokenTimeoutMins}
                                                onChange={(e) => handleConfigChange('tokenTimeoutMins', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-2">Avg Consultation Time (mins)</label>
                                            <input 
                                                type="number" 
                                                placeholder="e.g., 15" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                                                min="1"
                                                value={systemConfig.avgConsultationTime}
                                                onChange={(e) => handleConfigChange('avgConsultationTime', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Operating Hours */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-accent" />
                                        Operating Hours
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-700">Weekdays (Mon-Fri)</h4>
                                            <div>
                                                <label className="text-sm text-slate-600 block mb-2">Opening Time</label>
                                                <input 
                                                    type="time" 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                    value={systemConfig.weekdayOpen}
                                                    onChange={(e) => handleConfigChange('weekdayOpen', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-slate-600 block mb-2">Closing Time</label>
                                                <input 
                                                    type="time" 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                    value={systemConfig.weekdayClose}
                                                    onChange={(e) => handleConfigChange('weekdayClose', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-700">Weekends (Sat-Sun)</h4>
                                            <div>
                                                <label className="text-sm text-slate-600 block mb-2">Opening Time</label>
                                                <input 
                                                    type="time" 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                    value={systemConfig.weekendOpen}
                                                    onChange={(e) => handleConfigChange('weekendOpen', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-slate-600 block mb-2">Closing Time</label>
                                                <input 
                                                    type="time" 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                    value={systemConfig.weekendClose}
                                                    onChange={(e) => handleConfigChange('weekendClose', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="lg:col-span-2 flex gap-4 pt-4">
                                    <button 
                                        onClick={handleResetConfig}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Reset
                                    </button>
                                    <button 
                                        onClick={handleSaveConfig}
                                        disabled={configLoading}
                                        className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {configLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Settings'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {showDeptModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">New Department</h2>
                        <form onSubmit={handleAddDept} className="space-y-4">
                            <input
                                required placeholder="Name (e.g. Cardiology)"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                            />
                            <input
                                required placeholder="Code (e.g. CRD)"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24"
                                value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStaffModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Add New Staff</h2>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <input
                                required placeholder="Full Name"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                            />
                            <input
                                required type="email" placeholder="Email Address"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                            />
                            <input
                                required type="password" placeholder="Login Password"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                            />
                            <select
                                required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
                                value={newStaff.departmentId} onChange={e => setNewStaff({ ...newStaff, departmentId: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowStaffModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
