import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
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
            await register({ name, email, password, role });
            // Redirect to email verification page
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
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-medium group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

            {/* Registration Card */}
            <div className="w-full max-w-md bg-white shadow-xl border border-slate-100 rounded-2xl p-8">
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                        {/* Role Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setRole('patient')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                                    role === 'patient'
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                                    role === 'admin'
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm">Join QueueEase to manage your health visits</p>
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
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder-slate-400 transition-all outline-none"
                                placeholder="John Doe"
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
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder-slate-400 transition-all outline-none"
                                placeholder="example@gmail.com"
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
                                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder-slate-400 transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-70"
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

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        Already have an account?
                        <Link to="/login" className="font-bold text-slate-900 hover:text-primary transition-colors underline-offset-4 hover:underline ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            {/* Background Blur Effects */}
            <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]"></div>
            </div>
            </div>

            <Footer />
        </div>
    );
};

export default RegisterPage;
