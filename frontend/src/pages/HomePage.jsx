import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { ArrowRight, BookOpen, Zap, Users, Share2, Sliders, History, ChevronDown, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
    const { isLoggedIn, profile, authLoading } = useApp();
    const { t } = useTheme();
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const faqs = [
        {
            question: "How does NeuralPath identify my skill gaps?",
            answer: "When you upload a PDF resume, NeuralPath extracts the text content and uses an AI analyzer to identify your current skills. It then compares them against the requirements set for your target role to calculate your readiness score and list matching versus missing skills."
        },
        {
            question: "Can administrators customize target role benchmarks?",
            answer: "Yes, team administrators can create, update, or delete competency profiles for any role, specifying precisely which skills are required."
        },
        {
            question: "Where do the learning resources in my pathway come from?",
            answer: "Pathway video resources are curated and mapped directly to specific skills by team administrators, ensuring trainees get the exact material needed to bridge their skill gaps."
        },
        {
            question: "Can I track my progress as I complete learning pathway modules?",
            answer: "Yes! Trainees can mark individual pathway steps and modules as completed. This updates progress tracking logs in real-time, allowing team managers to monitor cohort readiness directly from the admin dashboard."
        },
        {
            question: "What formats of resumes are supported for uploading?",
            answer: "The platform currently accepts PDF resume files. Once uploaded, the backend programmatically extracts the document text to perform the competency audit."
        },
        {
            question: "Can we manage and track a cohort of multiple interns at the same time?",
            answer: "Yes! The administrator panel provides a unified dashboard for managers to view all active trainees, check their role readiness percentages, and track individual module completion progress."
        },
        {
            question: "How does NeuralPath help companies save engineering mentorship hours?",
            answer: "Instead of senior engineers manually identifying gaps and creating custom study guides for every new hire, NeuralPath automates this process by analyzing skills from resumes and delivering targeted, self-paced learning pathways with pre-mapped resource guides."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

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
        <div className="min-h-screen relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e0_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 -z-10 pointer-events-none" />

            <div className="absolute top-1/4 left-1/10 w-[350px] h-[350px] rounded-full pointer-events-none filter blur-[120px] opacity-15 -z-10 bg-amber-600" />

            <div className="max-w-5xl mx-auto relative z-10 pt-8 sm:pt-12">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="inline-flex items-center gap-2 border border-emerald-200/80 bg-emerald-50/70 text-emerald-900 px-3.5 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-wider mb-6 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Employee Competency Mapping & Upskilling Platform
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6"
                        style={{ color: t.textH }}
                    >
                        Assess & upskill your <span className="underline decoration-stone-200 decoration-8 underline-offset-2">trainees with precision.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="font-sans font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10"
                        style={{ color: t.textBody }}
                    >
                        NeuralPath helps engineering teams automate intern and trainee skill assessment. Identify critical skill gaps from resume credentials and generate structured, adaptive learning pathways to get them production-ready.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap"
                    >
                        <button
                            onClick={handleHeroClick}
                            className="bg-stone-900 text-white font-semibold text-xs py-3.5 px-6 rounded-full flex items-center gap-2 border border-stone-900 shadow-sm hover:bg-stone-850 transition-all active:scale-95 duration-100 cursor-pointer"
                        >
                            Assess Your Path <ArrowRight size={14} />
                        </button>
                    </motion.div>
                </div>

                <div className="text-center mb-10 mt-20">
                    <h2 className="text-3xl font-black tracking-tight" style={{ color: t.textH }}>
                        Powerful Features Built for Teams
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold mt-2" style={{ color: t.textMuted }}>
                        Everything you need for seamless intern competency tracking and trainee progress analysis
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <BookOpen size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Advanced Skill Mapping
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Map trainee competencies against production role benchmarks and skill requirements.
                        </p>
                    </div>

                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <Zap size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Real-Time Synergy
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Track cohort progress in real-time, monitoring learning metrics and training milestone completion.
                        </p>
                    </div>

                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <Users size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Trainee Coordination
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Audit trainee readiness, track learning curves, and coordinate mentoring sessions.
                        </p>
                    </div>

                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <Share2 size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Shared Path Sharing
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Instantly distribute standardized learning roadmaps to entire intern cohorts.
                        </p>
                    </div>

                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <Sliders size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Rich Customization
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Tailor role benchmarks, skill weights, and project-specific technological dependencies.
                        </p>
                    </div>

                    <div className="border rounded-[24px] p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, color: t.tagText }}>
                            <History size={18} />
                        </div>
                        <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                            Audit & Analytics
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: t.textMuted }}>
                            Complete audit trails of trainee assessments, quiz scores, and skill progression records.
                        </p>
                    </div>
                </div>

                <div className="mt-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
                    <div className="lg:col-span-5 space-y-8">
                        <h2 className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: t.textH }}>
                            Why  Teams choose   NeuralPath
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                                    1
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold" style={{ color: t.textH }}>Lightning Fast</h4>
                                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>Compute trainee skill gaps and construct personalized pathways with zero lag.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                                    2
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold" style={{ color: t.textH }}>Secure & Private</h4>
                                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>Role-based access controls and encrypted candidate profiles for enterprise security.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                                    3
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold" style={{ color: t.textH }}>Always Available</h4>
                                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>Built on high-availability MongoDB and Node.js backend infrastructure.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                                    4
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold" style={{ color: t.textH }}>Beautiful UI</h4>
                                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>Modern console for recruiters, admins, and trainees powered by React.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 border rounded-[28px] p-8 space-y-6 shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="space-y-2">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: t.linkText }}>Adaptive Pathways</h4>
                            <p className="text-xs leading-relaxed" style={{ color: t.textBody }}>
                                Trainee training modules adapt dynamically as they progress, highlighting resolved skill gaps.
                            </p>
                        </div>
                        <hr className="border-t" style={{ borderColor: t.divider }} />
                        <div className="space-y-2">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: t.linkText }}>Complete Toolset</h4>
                            <p className="text-xs leading-relaxed" style={{ color: t.textBody }}>
                                Benchmarking engines, custom role creators, video resource aggregators, and custom sorting rules.
                            </p>
                        </div>
                        <hr className="border-t" style={{ borderColor: t.divider }} />
                        <div className="space-y-2">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: t.linkText }}>Secure Audit Trails</h4>
                            <p className="text-xs leading-relaxed" style={{ color: t.textBody }}>
                                Create authenticated, secure workspaces with unique keys for HR audits and talent directory access.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-28 mb-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black tracking-tight" style={{ color: t.textH }}>
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold mt-2" style={{ color: t.textMuted }}>
                            Everything you need to know about how NeuralPath powers trainee upskilling
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="border rounded-[20px] transition-all duration-300 overflow-hidden shadow-sm"
                                    style={{ backgroundColor: t.bgCard, borderColor: t.border }}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base focus:outline-none transition-colors duration-200 cursor-pointer"
                                        style={{ color: t.textH }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <HelpCircle size={16} className="text-amber-600 shrink-0" />
                                            <span>{faq.question}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="shrink-0"
                                            style={{ color: t.textMuted }}
                                        >
                                            <ChevronDown size={18} />
                                        </motion.div>
                                    </button>
                                    
                                    <motion.div
                                        initial={false}
                                        animate={{ height: isOpen ? "auto" : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-1 border-t text-xs sm:text-sm leading-relaxed" style={{ borderColor: t.divider, color: t.textBody }}>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-28 text-center mb-10">
                    <h2 className="text-3xl font-black tracking-tight" style={{ color: t.textH }}>
                        Creative Minds Behind NeuralPath
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold mt-2" style={{ color: t.textMuted }}>
                        A passion project by developers who believe in structured technical growth
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-[24px] p-8 text-center flex flex-col items-center gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black shrink-0 shadow-sm animate-pulse" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                            HR
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                                Harsh Rajput
                            </h3>
                        </div>
                    </div>

                    <div className="border rounded-[24px] p-8 text-center flex flex-col items-center gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black shrink-0 shadow-sm animate-pulse" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                            HM
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                                Harshit Maurya
                            </h3>
                        </div>
                    </div>

                    <div className="border rounded-[24px] p-8 text-center flex flex-col items-center gap-4 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black shrink-0 shadow-sm animate-pulse" style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" }}>
                            HR
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-tight" style={{ color: t.textH }}>
                                Himanshu Ranjan
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="mt-28 border-t pt-12 pb-6" style={{ borderColor: t.divider }}>
                    <div className="flex flex-col items-center justify-center gap-4 mb-12 text-center">
                        <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: t.textH }}>Project</h4>
                        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                            <li>
                                <a href="https://github.com/Raj0-0dev/neuralpath" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline" style={{ color: t.textMuted }}>GitHub</a>
                            </li>
                            <li>
                                <a href="https://github.com/Raj0-0dev/neuralpath#readme" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline" style={{ color: t.textMuted }}>Docs</a>
                            </li>
                            <li>
                                <a href="https://github.com/Raj0-0dev/neuralpath/issues" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline" style={{ color: t.textMuted }}>Issues</a>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center pt-8 border-t" style={{ borderColor: t.divider }}>
                        <span className="text-xs font-semibold" style={{ color: t.textMuted }}>
                            &copy; 2026 NeuralPath. Built with &#128156; by Harsh Rajput, Harshit Maurya &amp; Himanshu Ranjan.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
