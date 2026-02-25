import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Users, Clock, Shield, Download } from 'lucide-react';
import Footer from '../../components/common/Footer';

const LandingPage = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <header className="bg-white border-b border-slate-200">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity className="text-primary w-8 h-8" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                            QueueEase
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/about" className="text-slate-600 hover:text-primary transition-colors font-medium">
                            About Us
                        </Link>
                        <Link to="/contact" className="text-slate-600 hover:text-primary transition-colors font-medium">
                            Contact Us
                        </Link>
                        {deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="hidden md:flex items-center gap-2 px-4 py-2 text-primary font-bold hover:bg-emerald-50 rounded-lg transition-colors border border-primary/20"
                            >
                                <Download className="w-4 h-4" /> Install App
                            </button>
                        )}
                        <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-primary transition-colors font-medium">Login</Link>
                        <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-primary/20 font-bold">
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                <section className="container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                        Hospital Queuing <br />
                        <span className="text-primary">Made Simple & Stress-Free</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        QueueEase helps hospitals manage patient flow efficiently with real-time digital tokens and automated alerts.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="px-8 py-3 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-primary/30">
                            Join as a Patient
                        </Link>
                        <button className="px-8 py-3 bg-white text-slate-700 border border-slate-200 text-lg font-semibold rounded-xl hover:bg-slate-50 transition-all">
                            Learn More
                        </button>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all group">
                                <Clock className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-4">Real-time Wait Times</h3>
                                <p className="text-slate-600">Track your queue status from anywhere in real-time. No more waiting in crowded rooms.</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary/30 transition-all group">
                                <Users className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-4">Easy Management</h3>
                                <p className="text-slate-600">Staff can call patients, skip, or reassign queues with a single click from their console.</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-accent/30 transition-all group">
                                <Shield className="w-12 h-12 text-accent mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-4">Secure & Reliable</h3>
                                <p className="text-slate-600">Role-based access ensures data privacy and secure transactions for all users.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
