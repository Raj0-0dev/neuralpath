import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    BrainCircuit,
    Briefcase,
    Building
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
    const { refreshProgress, signInEmail, signUpEmail, signInGoogle } = useApp();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("employee");
    const [targetRole, setTargetRole] = useState("");
    const [company, setCompany] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleAuthResult = async (resPromise) => {
        setLoading(true);
        setMessage(null);
        try {
            const data = await resPromise;
            await refreshProgress();
            setMessage({ text: "secure access authenticated.", isError: false });

            const targetUserRole = data?.user?.role || role;
            setTimeout(() => {
                if (targetUserRole === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/upload");
                }
            }, 1000);
        } catch (err) {
            console.error(err);
            setMessage({ text: err.message || "Credential validation failed.", isError: true });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            if (!email || !password) {
                setMessage({ text: "fields required.", isError: true });
                return;
            }
            handleAuthResult(signInEmail(email, password));
        } else {
            if (!email || !password || !name) {
                setMessage({ text: "required fields missing.", isError: true });
                return;
            }
            handleAuthResult(signUpEmail(email, password, { name, role, targetRole: role === "employee" ? targetRole : "", company }));
        }
    };



    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center pb-16 px-4 bg-[#FAF9F6]">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full ${isLogin ? "max-w-sm" : "max-w-md"} bg-white border border-stone-200 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300`}
            >
                <div className={`text-center ${isLogin ? "mb-8" : "mb-6"}`}>
                    <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BrainCircuit className="text-stone-900" size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-2">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    {isLogin && (
                        <p className="text-stone-500 text-xs font-semibold">
                            Access secure tailored technical roadmaps.
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isLogin ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="email"
                                        placeholder="developer@neuralpath.ai"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Password</label>
                                    <button type="button" className="text-[10px] font-black text-stone-500 hover:underline">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stacked Core Fields */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="email"
                                        placeholder="developer@neuralpath.ai"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Side-by-Side Role Config Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={`space-y-1.5 ${role === "admin" ? "sm:col-span-2" : "sm:col-span-1"}`}>
                                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Account Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors cursor-pointer appearance-none"
                                    >
                                        <option value="employee">Candidate View</option>
                                        <option value="admin">HR Admin View</option>
                                    </select>
                                </div>

                                {role === "employee" ? (
                                    <div className="space-y-1.5 sm:col-span-1">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Target Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Cloud Architect"
                                                value={targetRole}
                                                onChange={(e) => setTargetRole(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${message.isError
                                    ? "text-red-800 bg-red-50 border-red-200"
                                    : "text-amber-800 bg-amber-50 border-amber-200"
                                    }`}
                            >
                                <span>{message.text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-4 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-100 disabled:text-stone-400 text-white font-extrabold rounded-full transition-all shadow-md shadow-stone-950/10 flex items-center justify-center gap-1.5 text-xs active:scale-98 cursor-pointer"
                    >
                        {loading ? (
                            "authenticating..."
                        ) : (
                            <>
                                {isLogin ? "Sign In to Dashboard" : "Create Account"}
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-stone-500 font-semibold">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage(null);
                        }}
                        className="text-stone-900 font-extrabold hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
