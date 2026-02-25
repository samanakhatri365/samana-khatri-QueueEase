import React from 'react';
import { User, Mail, Phone, MapPin, Shield, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
                        <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-[2rem]">
                            <div className="w-24 h-24 bg-slate-100 rounded-[1.8rem] flex items-center justify-center text-primary border-4 border-white">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-10 px-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Full Name'}</h1>
                                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                                    <Shield className="w-4 h-4" />
                                    {user?.role || 'Patient'}
                                </div>
                            </div>
                            <button className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                                Edit Profile
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase">Email Address</div>
                                    <div className="text-slate-700 font-medium">{user?.email || 'user@example.com'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase">Phone Number</div>
                                    <div className="text-slate-700 font-medium">+977 98XXXXXXXX</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
