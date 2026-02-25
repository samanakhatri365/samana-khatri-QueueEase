import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await forgotPassword({ email });
            setSuccess(true);
            
            // Redirect to reset password page after 3 seconds
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code. Please check your email and try again.');
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
                        to="/login" 
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-medium mb-6 group transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
                                <Mail className="w-6 h-6 text-orange-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Your Password</h1>
                            <p className="text-slate-500 text-sm">
                                Enter your email address and we'll send you a code to reset your password.
                            </p>
                        </div>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>Reset code sent to your email! Redirecting...</div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={isLoading || success}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-50 outline-none disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                                />
                                <p className="text-slate-500 text-xs mt-2">
                                    We'll send a reset code to this email address
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!email || isLoading || success}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Code Sent!
                                    </>
                                ) : (
                                    'Send Reset Code'
                                )}
                            </button>
                        </form>

                        {/* Links */}
                        <div className="text-center mt-6 pt-6 border-t border-slate-100">
                            <p className="text-slate-600 text-sm">
                                Remember your password?{' '}
                                <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
