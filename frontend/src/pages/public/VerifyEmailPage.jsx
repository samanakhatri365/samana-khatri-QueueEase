import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { verifyEmail } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await verifyEmail({ verificationCode: code });
            setSuccess(true);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login', { state: { message: 'Email verified successfully! Please login.' } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
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
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
                            <p className="text-slate-500 text-sm">
                                {email && `We sent a verification code to ${email}`}
                            </p>
                        </div>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>Email verified successfully! Redirecting to login...</div>
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
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    disabled={isLoading || success}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none text-center text-lg tracking-widest font-semibold disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                                    maxLength="6"
                                />
                                <p className="text-slate-500 text-xs mt-2">
                                    6-digit code from your email
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!code || isLoading || success}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </form>

                        {/* Help Text */}
                        <p className="text-center text-slate-500 text-sm mt-6">
                            Didn't receive the code? Check your spam folder or contact support.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default VerifyEmailPage;
