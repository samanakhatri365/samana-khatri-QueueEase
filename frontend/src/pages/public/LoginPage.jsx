import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(email, password);
            const userRole = data.user.role;

            // Redirect based on role
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'staff') navigate('/staff-console');
            else navigate('/dashboard');
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
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-medium mb-6 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {/* Header with Role Badge */}
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold text-slate-900">Login</h1>
                            <div className={`px-3 py-1 text-[10px] font-bold tracking-widest rounded-md uppercase ${
                                role === 'patient' 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : role === 'staff'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-sky-100 text-sky-600'
                            }`}>
                                {role === 'patient' ? 'Patient' : role === 'staff' ? 'Staff' : 'Admin'}
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm mb-8">Welcome back to QueueEase healthcare portal</p>

                        {/* Role Toggle */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => setRole('patient')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                    role === 'patient'
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Patient
                            </button>
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
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900 placeholder-slate-400 transition-all"
                                        placeholder="samanakoirala123@gmail.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-medium text-sky-500 hover:underline">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900 placeholder-slate-400 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-70"
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

                        <div className="mt-10 text-center">
                            <p className="text-slate-500 text-sm">
                                Don't have an account?
                                <Link to="/register" className="text-slate-900 font-bold hover:underline ml-1">Sign Up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative dots */}
            <div className="flex justify-center gap-4 pb-8 opacity-50">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            </div>

            <Footer />
        </div>
    );
};

export default LoginPage;
