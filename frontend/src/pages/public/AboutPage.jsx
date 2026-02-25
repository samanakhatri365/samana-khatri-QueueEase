import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle, Eye, ShieldCheck, Download } from 'lucide-react';

const AboutPage = () => {
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
            {/* Header - Same as Landing Page */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Activity className="text-primary w-8 h-8" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                            QueueEase
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-slate-600 hover:text-primary transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/about" className="text-primary font-bold border-b-2 border-primary pb-1">
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
                        <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-primary transition-colors font-medium">
                            Login
                        </Link>
                        <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-primary/20 font-bold">
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Page Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        About <span className="text-primary">QueueEase</span>: Redefining the Experience
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
                </div>

                {/* Our Journey Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-3xl font-bold text-slate-900">Our Journey</h2>
                        <p className="text-slate-700 text-lg leading-relaxed">
                            Making hospital queuing stress-free was our founding goal. We saw the frustration of long wait times and built a tech-driven solution to optimize patient flow and prioritize care.
                        </p>
                        <p className="text-slate-600 text-base leading-relaxed">
                            Our story began in 2021 when a team of healthcare professionals and software engineers joined forces to tackle the administrative bottlenecks that plague modern healthcare systems. Today, we serve over 150 facilities globally.
                        </p>
                        <div className="flex gap-8 mt-4">
                            <div>
                                <p className="text-3xl font-black text-primary">150+</p>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Hospitals</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-primary">2M+</p>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Patients</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-xl blur-2xl group-hover:bg-primary/20 transition duration-500"></div>
                        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shadow-xl overflow-hidden flex items-center justify-center">
                            <Activity className="w-24 h-24 text-primary/40" />
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="mb-24">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Mission & Vision</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Mission Card */}
                        <div className="flex flex-col gap-5 p-8 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/20 text-primary w-14 h-14 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Streamlining healthcare access for everyone through innovative digital solutions that prioritize human time.
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="flex flex-col gap-5 p-8 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-sky-100 text-sky-500 w-14 h-14 rounded-lg flex items-center justify-center">
                                <Eye className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    A world where medical care is never delayed by logistics, making quality healthcare truly accessible.
                                </p>
                            </div>
                        </div>

                        {/* Values Card */}
                        <div className="flex flex-col gap-5 p-8 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-orange-100 text-orange-500 w-14 h-14 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Values</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Innovation, Patient-First approach, and absolute Transparency in everything we build.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Activity className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Ready to transform your clinic?</h2>
                        <p className="text-white/70 mb-8 max-w-xl mx-auto">
                            Join hundreds of forward-thinking healthcare providers who are reclaiming their time and improving patient satisfaction.
                        </p>
                        <Link 
                            to="/register"
                            className="inline-block bg-primary hover:bg-emerald-700 text-white px-10 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-xl"
                        >
                            Join Us Now
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-12 py-12">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-primary w-6 h-6" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                                QueueEase
                            </span>
                        </div>
                        <p className="text-slate-500 max-w-sm">
                            A smarter way to manage healthcare queues and improve patient experiences across the globe.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link className="hover:text-primary transition-colors font-bold text-primary" to="/about">About Us</Link></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                            <li><Link className="hover:text-primary transition-colors" to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">© 2024 QueueEase. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
