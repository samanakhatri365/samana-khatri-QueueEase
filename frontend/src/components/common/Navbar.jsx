import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar = ({ showAuthButtons = true }) => {
    return (
        <header className="bg-white border-b border-slate-200">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <Activity className="text-primary w-8 h-8" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                        QueueEase
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/about" className="text-slate-600 hover:text-primary transition-colors font-medium">
                        About Us
                    </Link>
                    <Link to="/contact" className="text-slate-600 hover:text-primary transition-colors font-medium">
                        Contact Us
                    </Link>
                    {showAuthButtons && (
                        <>
                            <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-primary transition-colors font-medium">
                                Login
                            </Link>
                            <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-primary/20 font-bold">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
