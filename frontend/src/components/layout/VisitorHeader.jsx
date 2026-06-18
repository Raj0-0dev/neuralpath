import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Menu, X, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VisitorHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, profile, handleLogOut } = useApp();

    const handleLogoutClick = async () => {
        await handleLogOut();
        navigate("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FCFBF9]/90 backdrop-blur-md border-b border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-xl bg-stone-900 text-white group-hover:bg-stone-850 transition-colors">
                            <BrainCircuit size={18} />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-stone-900">Neural<span className="text-amber-600">Path</span></span>
                    </Link>

                    {/* Active indicator */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100/80 text-[10px] font-semibold tracking-wide uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                        </span>
                        May '26 Onboarding Rollout
                    </div>
                </div>

                {/* Right side Actions */}
                <div className="md:flex items-center gap-5">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-5">
                            <Link
                                to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                                className="text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                Go to Workspace
                            </Link>
                            <button
                                onClick={handleLogoutClick}
                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                Sign Out <LogOut size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-5">
                            {location.pathname === '/login' ? (
                                <Link
                                    to="/"
                                    className="text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
                                >
                                    Home
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
                                >
                                    Sign In
                                </Link>
                            )}
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                {!isLoggedIn && (
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Visitor Mobile Menu */}
            <AnimatePresence>
                {isOpen && !isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute left-0 right-0 top-16 bg-[#FCFBF9] border border-stone-200 shadow-xl rounded-3xl p-4 overflow-hidden md:hidden mx-2 mt-1"
                    >
                        <div className="space-y-2">
                            {location.pathname === '/login' ? (
                                <Link
                                    to="/"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center py-3 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                                >
                                    Go to Homepage
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center py-3 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                                >
                                    Sign In
                                </Link>
                            )}
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block text-center py-3 rounded-2xl text-sm font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
