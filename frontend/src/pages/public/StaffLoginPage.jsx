import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const StaffLoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(email, password);
            const userRole = data.user.role;

            if (userRole === 'patient') {
                setError('Patient accounts should use the patient login page.');
                return;
            }

            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'staff') navigate('/staff-console');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar showAuthButtons={false} />

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium mb-6 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                                <h1 className="text-2xl font-bold text-slate-900">Staff / Admin Login</h1>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm mb-8">Access the QueueEase management portal</p>

                        {/* Role Toggle */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => setRole('staff')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                    role === 'staff'
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                    role === 'admin'
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Admin
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all"
                                        placeholder="staff@hospital.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-medium text-blue-500 hover:underline">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center space-y-3">
                            <p className="text-slate-500 text-sm">
                                Don't have a staff account?
                                <Link to="/staff-register" className="text-slate-900 font-bold hover:underline ml-1">Register</Link>
                            </p>
                            <p className="text-slate-400 text-xs">
                                Are you a patient?
                                <Link to="/login" className="text-blue-500 font-semibold hover:underline ml-1">Patient Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative dots */}
            <div className="flex justify-center gap-4 pb-8 opacity-50">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>

            <Footer />
        </div>
    );
};

export default StaffLoginPage;
