import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const email = location.state?.email || '';

    const validatePassword = () => {
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword()) return;

        setIsLoading(true);

        try {
            await resetPassword({
                otp,
                password
            });
            setSuccess(true);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login', { state: { message: 'Password reset successfully! Please login with your new password.' } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP and try again.');
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
                        to="/forgot-password" 
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-medium mb-6 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </Link>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                                <Lock className="w-6 h-6 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Password</h1>
                            <p className="text-slate-500 text-sm">
                                {email && `For ${email}`}
                            </p>
                        </div>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>Password reset successfully! Redirecting to login...</div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* OTP Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Reset Code (OTP)
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    disabled={isLoading || success}
                                    required
                                    maxLength="6"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 outline-none text-center text-lg tracking-widest font-semibold disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                                />
                                <p className="text-slate-500 text-xs mt-2">
                                    6-digit code sent to your email
                                </p>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        disabled={isLoading || success}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 outline-none pr-10 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading || success}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-slate-500 text-xs mt-2">
                                    At least 6 characters
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        disabled={isLoading || success}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 outline-none pr-10 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading || success}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!otp || !password || !confirmPassword || isLoading || success}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-8"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Password Reset!
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>

                        {/* Help Text */}
                        <p className="text-center text-slate-500 text-sm mt-6">
                            Didn't receive the code?{' '}
                            <Link to="/forgot-password" className="text-green-600 hover:text-green-700 font-semibold">
                                Request new code
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ResetPasswordPage;
