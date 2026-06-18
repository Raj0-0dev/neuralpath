import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Compass, FileText, ArrowRight, Target } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
    const { isLoggedIn, profile, authLoading } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isLoggedIn) {
            if (profile?.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [isLoggedIn, profile, authLoading, navigate]);

    if (authLoading) {
        return null;
    }

    const handleHeroClick = () => {
        if (isLoggedIn) {
            if (profile?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/upload");
            }
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#FAF9F6] pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8">
            {/* Dusty Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e0_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 -z-10 pointer-events-none" />

            {/* Background elegant touch */}
            <div className="absolute top-1/4 left-1/10 w-[350px] h-[350px] rounded-full pointer-events-none filter blur-[120px] opacity-15 -z-10 bg-amber-600" />

            <div className="max-w-5xl mx-auto relative z-10 pt-8 sm:pt-12">
                {/* Core Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="inline-flex items-center gap-2 border border-amber-200/80 bg-amber-50/70 text-amber-900 px-3.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-wider mb-6 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        Next-Generation Career Roadmapping Tool
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-sans text-stone-900 font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6 lowercase"
                    >
                        engineered to bridge <span className="underline decoration-stone-200 decoration-8 underline-offset-2">critical skill gaps.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="text-stone-500 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10 font-sans"
                    >
                        NeuralPath automatically structures granular, adaptive learning modules to guide engineering teams and developers through complex technical progressions.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap"
                    >
                        <button
                            onClick={handleHeroClick}
                            className="bg-stone-900 text-white font-semibold text-xs py-3.5 px-6 rounded-full flex items-center gap-2 border border-stone-900 shadow-sm hover:bg-stone-800 transition-all active:scale-95 duration-100 cursor-pointer"
                        >
                            Assess Your Path <ArrowRight size={14} />
                        </button>

                    </motion.div>
                </div>

                {/* Feature Cards Bento Grid Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                >
                    {/* Card 1 */}
                    <div className="bg-white border border-stone-200/80 rounded-[28px] p-8 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:border-stone-300">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <FileText size={18} />
                        </div>
                        <h3 className="font-sans text-stone-900 text-base font-bold tracking-tight lowercase">
                            strategic skills parser
                        </h3>
                        <p className="font-sans text-stone-500 font-medium text-xs leading-relaxed">
                            Upload resumes and target job descriptions. Extract real, learnable technical competencies, traits, and soft attributes directly.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-stone-200/80 rounded-[28px] p-8 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:border-stone-300">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Target size={18} />
                        </div>
                        <h3 className="font-sans text-stone-900 text-base font-bold tracking-tight lowercase">
                            rigorous gap evaluator
                        </h3>
                        <p className="font-sans text-stone-500 font-medium text-xs leading-relaxed">
                            Evaluate overall role readiness through systematic radar comparisons, identifying priority high-magnitude deficiencies.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-stone-200/80 rounded-[28px] p-8 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:border-stone-300">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Compass size={18} />
                        </div>
                        <h3 className="font-sans text-stone-900 text-base font-bold tracking-tight lowercase">
                            adaptive learning pathways
                        </h3>
                        <p className="font-sans text-stone-500 font-medium text-xs leading-relaxed">
                            Sort skill modules mathematically using Kahn's topological sort based on structural dependencies, constructing high-value phases.
                        </p>
                    </div>
                </motion.div>

                {/* Gated Access Footer Label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-12 text-center p-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50"
                >
                    <span className="font-mono text-[9px] text-stone-400 uppercase tracking-wider">
                        🔒 Built on secure RBAC protocols. Credentials encrypted dynamically using standard encryption models.
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
