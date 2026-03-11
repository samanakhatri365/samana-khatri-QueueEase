import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const StaffRegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const role = 'admin';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register({ name, email, password, role });
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col transition-colors duration-300">
            <Navbar showAuthButtons={false} />

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Back Button */}
                <div className="w-full max-w-md mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                {/* Registration Card */}
                <div className="w-full max-w-md bg-white shadow-xl border border-slate-100 rounded-2xl p-8">
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                                <h1 className="text-2xl font-bold text-slate-900">Admin Register</h1>
                            </div>
                            <div className="px-3 py-1 text-[10px] font-bold tracking-widest rounded-md uppercase bg-blue-100 text-blue-600">
                                Admin
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm">Register as an admin to manage QueueEase</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all outline-none"
                                    placeholder="Dr. Jane Smith"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all outline-none"
                                    placeholder="staff@hospital.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Register
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
                        <p className="text-sm text-slate-500">
                            Already have an admin account?
                            <Link to="/staff-login" className="font-bold text-slate-900 hover:text-blue-600 transition-colors underline-offset-4 hover:underline ml-1">
                                Sign In
                            </Link>
                        </p>
                        <p className="text-slate-400 text-xs">
                            Are you a patient?
                            <Link to="/register" className="text-blue-500 font-semibold hover:underline ml-1">Patient Register</Link>
                        </p>
                    </div>
                </div>

                {/* Background Blur Effects */}
                <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden opacity-40 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]"></div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StaffRegisterPage;
