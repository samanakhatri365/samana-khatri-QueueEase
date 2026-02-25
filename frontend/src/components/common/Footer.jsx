import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Footer = () => {
    return (
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
                        <li><Link className="hover:text-primary transition-colors" to="/about">About Us</Link></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                        <li><Link className="hover:text-primary transition-colors" to="/contact">Contact</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400">© 2024 QueueEase. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
