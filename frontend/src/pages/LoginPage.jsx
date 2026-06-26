import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    BrainCircuit,
    Briefcase,
    Building,
    Eye,
    EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
    const { isLoggedIn, profile, authLoading, refreshProgress, signInEmail, signUpEmail, signInGoogle } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isLoggedIn) {
            if (profile?.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                if (!profile?.targetRole) {
                    navigate("/upload", { replace: true });
                } else {
                    navigate("/dashboard", { replace: true });
                }
            }
        }
    }, [isLoggedIn, profile, authLoading, navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("employee");
    const [targetRole, setTargetRole] = useState("");
    const [company, setCompany] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (authLoading) {
        return null;
    }

    const handleAuthResult = async (resPromise) => {
        setLoading(true);
        setMessage(null);
        try {
            const data = await resPromise;
            await refreshProgress();
            setMessage({ text: "secure access authenticated.", isError: false });

            const targetUserRole = data?.user?.role || role;
            const hasTargetRole = !!(data?.user?.targetRole || profile?.targetRole);
            setTimeout(() => {
                if (targetUserRole === "admin") {
                    navigate("/admin");
                } else {
                    if (hasTargetRole) {
                        navigate("/dashboard");
                    } else {
                        navigate("/upload");
                    }
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
            handleAuthResult(signInEmail(email, password, role));
        } else {
            if (!email || !password || !name || !confirmPassword) {
                setMessage({ text: "required fields missing.", isError: true });
                return;
            }
            if (password !== confirmPassword) {
                setMessage({ text: "passwords do not match.", isError: true });
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
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Email Address</label>
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
                                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">Password</label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer flex items-center justify-center"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Sign In As</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                                >
                                    <option value="employee">Candidate / Employee</option>
                                    <option value="admin">HR Admin View</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stacked Core Fields */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Full Name</label>
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
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Email Address</label>
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
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer flex items-center justify-center"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors"
                                        required
                                    />
                                    {confirmPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer flex items-center justify-center"
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    )}
                                </div>
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
                            setConfirmPassword("");
                            setShowPassword(false);
                            setShowConfirmPassword(false);
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
