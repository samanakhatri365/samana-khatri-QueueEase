import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, MapPin, Phone, Mail, Download, Send } from 'lucide-react';
import { getSystemConfig, submitContactMessage } from '../../services/api';

const ContactPage = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [hospitalInfo, setHospitalInfo] = useState({
        hospitalName: 'QueueEase Hospital',
        email: 'support@queueease.com',
        phone: '+1 (555) QUEUE-01',
        address: '123 Healthcare Plaza, Suite 400\nSan Francisco, CA 94103'
    });

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        // Fetch hospital info from system config
        const fetchHospitalInfo = async () => {
            try {
                const res = await getSystemConfig();
                if (res.data) {
                    setHospitalInfo({
                        hospitalName: res.data.hospitalName || 'QueueEase Hospital',
                        email: res.data.email || 'support@queueease.com',
                        phone: res.data.phone || '+1 (555) QUEUE-01',
                        address: res.data.address || '123 Healthcare Plaza, Suite 400\nSan Francisco, CA 94103'
                    });
                }
            } catch (error) {
                console.log('Failed to load hospital info:', error);
            }
        };
        fetchHospitalInfo();
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitContactMessage(formData);
            alert('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            alert('Failed to send message: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
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
                        <Link to="/about" className="text-slate-600 hover:text-primary transition-colors font-medium">
                            About Us
                        </Link>
                        <Link to="/contact" className="text-primary font-bold border-b-2 border-primary pb-1">
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

            <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16">
                {/* Page Title */}
                <div className="mb-12 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Contact Support</h1>
                    <p className="text-slate-500 text-lg">We're here to help you manage your clinic's workflow seamlessly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Contact Form */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-sm font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-sm font-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 text-sm font-semibold">Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white h-12 px-4 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing Inquiry</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="general">General Question</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 text-sm font-semibold">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                    placeholder="How can we help you?"
                                    rows={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-primary text-white font-bold py-4 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-8 h-full justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
                                <div className="flex flex-col gap-8">
                                    {/* Office Location */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Our Office</p>
                                            <p className="text-slate-500 whitespace-pre-line">{hospitalInfo.address}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Phone Number</p>
                                            <p className="text-slate-500">{hospitalInfo.phone}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Support Email</p>
                                            <p className="text-slate-500">{hospitalInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <p className="text-sm text-slate-500 mb-4">
                                    Typical response time: <span className="font-semibold text-primary">Under 2 hours</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-primary w-6 h-6" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                                QueueEase
                            </span>
                        </div>
                        <p className="text-slate-500 max-w-sm">
                            Revolutionizing patient flow management for modern healthcare clinics around the globe.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link className="hover:text-primary transition-colors" to="/about">About Us</Link></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
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

export default ContactPage;
