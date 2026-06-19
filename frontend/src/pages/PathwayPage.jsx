import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  Compass,
  ChevronRight,
  Award,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Play,
  Zap,
  Terminal,
  ArrowRight,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PathwayPage() {
  const { t, isDark } = useTheme();
  const {
    pathway,
    setPathway,
    adaptPathwayOnServer,
    completedModules,
    toggleModuleCompleted,

  } = useApp();
  const isLoggedIn = true;
  const navigate = useNavigate();

  // Navigation states
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [activeSection, setActiveSection] = useState(1); // represented by buttons 1, 2, 3

  // Modals state
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(85);
  const [quizSuccessMsg, setQuizSuccessMsg] = useState(null);

  // Sandbox State
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState("");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [sandboxRunning, setSandboxRunning] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="pt-6 md:pt-20 pb-16 px-4 md:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-5 relative">
        <Compass size={48} className="text-amber-600" />
        <p className="font-sans text-stone-600 font-medium text-base">
          please sign-in to access candidate qualifications roadmaps.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-stone-900 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-stone-800 transition-all active:scale-95 duration-100 border border-stone-100 shadow-sm"
        >
          Sign-In Portal
        </button>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="pt-6 md:pt-20 pb-16 px-4 md:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-5 relative">
        <Compass size={56} className="text-amber-600 animate-pulse" />
        <h3 className="font-sans text-stone-950 text-2xl font-black lowercase tracking-tight">
          no onboarding roadmap active
        </h3>
        <p className="font-sans text-stone-600 font-medium text-sm text-center max-w-sm leading-relaxed">
          upload your candidate specifications and trigger topological gap aligned roadmap creation.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/upload")}
          id="navigate-upload-btn"
          className="bg-stone-900 text-white font-bold text-sm px-8 py-3.5 rounded-full border border-stone-850 hover:bg-stone-800 transition-all duration-100 active:scale-95"
        >
          Synthesize Pathway Track
        </motion.button>
      </div>
    );
  }

  // Create flat list of all modules sequentially
  const allModules = pathway.phases?.flatMap((phase) =>
    phase.modules.map((mod) => ({
      ...mod,
      phaseTitle: phase.title,
      phaseColor: phase.color
    }))
  ) || [];

  // Determine active inspect module
  const activeModule =
    allModules.find((m) => m.id === selectedModuleId) ||
    allModules.find((m) => !completedModules.has(m.id)) ||
    allModules[0];

  const activeIndex = allModules.findIndex((m) => m.id === activeModule?.id);

  const handleModuleToggle = async (mod, phaseTitle) => {
    if (mod.type === "Quiz") {
      setSelectedQuiz({ ...mod, phaseTitle });
      setQuizSuccessMsg(null);
    } else {
      await toggleModuleCompleted(mod.id, { ...mod, phaseTitle });
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedQuiz) return;

    await adaptPathwayOnServer(selectedQuiz.id, quizScore);

    await toggleModuleCompleted(selectedQuiz.id, {
      title: selectedQuiz.title,
      type: "Quiz",
      phaseTitle: selectedQuiz.phaseTitle,
      duration: selectedQuiz.duration
    });

    setQuizSuccessMsg(
      quizScore < 70
        ? `Assessment score reported at ${quizScore}%. Dynamic alignment complete: supplementary remedial learning steps integrated.`
        : `Assessment authenticated with ${quizScore}%. Credentials validated successfully!`
    );

    setTimeout(() => {
      setSelectedQuiz(null);
    }, 3200);
  };

  // Switch to next module
  const handleContinueLesson = async () => {
    if (!activeModule) return;

    // Toggle current module as completed if not already completed
    if (!completedModules.has(activeModule.id)) {
      await toggleModuleCompleted(activeModule.id, {
        title: activeModule.title,
        type: activeModule.type,
        phaseTitle: activeModule.phaseTitle,
        duration: activeModule.duration
      });
    }

    // Advance to next index
    const nextIndex = activeIndex + 1;
    if (nextIndex < allModules.length) {
      setSelectedModuleId(allModules[nextIndex].id);
      setActiveSection(1);
    }
  };

  const handlePreviousModule = () => {
    const prevIndex = activeIndex - 1;
    if (prevIndex >= 0) {
      setSelectedModuleId(allModules[prevIndex].id);
      setActiveSection(1);
    }
  };

  const handleOpenSandbox = () => {
    // Generate dynamic boilerplate sample code based on the active module title
    const modTitle = activeModule?.title || "TypeScript Module";
    let bCode = `// [NeuralPath Native Sandbox Playroom]\n`;
    if (modTitle.includes("TypeScript")) {
      bCode += `/**\n * Topic: TypeScript High-Performance Benchmark Compiler Loop\n */\nclass AstBenchmarker {\n  static measureLoopExecution() {\n    const start = performance.now();\n    let sum = 0;\n    // Optimize layout structures\n    for (let i = 0; i < 2000000; i++) {\n      sum += (i % 2 === 0) ? 1 : 0;\n    }\n    return performance.now() - start;\n  }\n}\n\nconsole.log("Analyzing performance layout...");\nconst executionMs = AstBenchmarker.measureLoopExecution().toFixed(4);\nconsole.log(\`[Success] Loop executed in \${executionMs} ms\`);\n`;
    } else if (modTitle.includes("React") || modTitle.includes("Frontend")) {
      bCode += `/**\n * Topic: React Component Reconciliation & Fiber Optimizations\n */\nfunction simulateReconciliation() {\n  const virtualTreeSize = 50000;\n  console.log(\`Reconciling virtual render tree with \${virtualTreeSize} interactive fiber items...\`);\n  const start = performance.now();\n  const memoizedArray = Array.from({ length: virtualTreeSize }, (_, i) => \`ComponentNode_\${i}\`);\n  const duration = (performance.now() - start).toFixed(2);\n  console.log(\`React Fiber tree updated synchronously in \${duration}ms\`);\n}\n\nsimulateReconciliation();\n`;
    } else {
      bCode += `/**\n * Topic: ${modTitle} Lab Exercise\n */\nfunction runDiagnosticTest() {\n  console.log("Performing dynamic sanity check on compiled module attributes...");\n  const score = Math.round(75 + Math.random() * 25);\n  console.log(\`Integration successful! Internal score verification: \${score}%\`);\n}\n\nrunDiagnosticTest();\n`;
    }
    setSandboxCode(bCode);
    setSandboxOutput("Ready to execute live workspace test script...");
    setIsSandboxOpen(true);
  };

  const handleRunSandboxCode = () => {
    setSandboxRunning(true);
    setSandboxOutput("Initializing remote sandbox compiler environment...\nStarting AST generation & bundle optimizations...\n");
    setTimeout(() => {
      try {
        // Safe evaluation simulation
        let customLog = "";
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          customLog += args.join(" ") + "\n";
        };
// Execute code
        new Function(sandboxCode)();

        console.log = originalConsoleLog;
        setSandboxOutput((prev) => prev + "\n[System Logs]\n" + customLog + "\n[Result: COMPILATION SUCCESSFUL]");
      } catch (err) {
        setSandboxOutput((prev) => prev + `\n🛑 [Compiler Error] ${err.message}`);
      } finally {
        setSandboxRunning(false);
      }
    }, 1200);
  };

  const totalModulesCount = allModules.length;
  const completedModulesCount = allModules.filter((m) => completedModules.has(m.id)).length;
  const pathReadinessProgress =
    totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

  return (
    <div className="pt-6 md:pt-14 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="relative z-10">

        {/* Dynamic Roadtrack Sequential Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: CURRICULUM PATH TIMELINE & INTENTIONAL GAP CAPTURE */}
          <div className="lg:col-span-5 space-y-6">

            {/* CARD 1: CURRICULUM PATH */}
            <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 pb-2 border-b border-stone-100">
                <Compass className="text-stone-700" size={18} />
                <h2 className="font-sans text-[11px] font-black text-stone-400 uppercase tracking-widest">
                  Curriculum Path
                </h2>
              </div>

              {/* Timeline Modules Sequence list */}
              <div className="relative pl-1 pr-1 space-y-0.5">
                {/* Vertical Connector Line running behind indicators */}
                <div
                  className="absolute left-6 top-5 bottom-8 w-[2px] bg-stone-100 pointer-events-none"
                  aria-hidden="true"
                />

                {allModules.map((mod, idx) => {
                  const isDone = completedModules.has(mod.id);
                  const isActive = activeModule?.id === mod.id;
                  const isRemedial = mod.id.includes("remedial_");

                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setActiveSection(1);
                      }}
                      className={`relative flex items-start gap-5 p-4 rounded-2xl cursor-pointer transition-all duration-200 select-none ${isActive
                        ? "bg-amber-50/40 border border-amber-200/60"
                        : "border border-transparent hover:bg-stone-50/60"
                        }`}
                    >
                      {/* Left Dot Indicator */}
                      <div className="relative z-10 flex items-center justify-center w-4 h-4 mt-1">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 border border-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full bg-white border-2 border-stone-900 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-white border border-stone-300 shrink-0" />
                        )}
                      </div>

                      {/* Title & Stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-xs font-bold leading-tight tracking-tight ${isActive ? "text-stone-950" : isDone ? "text-stone-400 font-medium" : "text-stone-700"
                            }`}>
                            {mod.title}
                          </h4>
                          {isRemedial && (
                            <span className="text-[8px] font-black tracking-wider uppercase text-amber-900 bg-amber-50 border border-amber-200/50 px-1 rounded-sm">
                              Remedial
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 font-semibold mt-1 uppercase tracking-wide">
                          {mod.duration} • {mod.level || "Intermediate"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: INTELLIGENT GAP FIX */}
            <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-amber-500 fill-amber-500" size={16} />
                <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest">
                  Intelligent Gap Fix
                </h3>
              </div>
              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                Based on gaps identified, modules prioritize <strong className="text-stone-900 font-bold">"{activeModule?.title || "TypeScript Performance"}"</strong> to establish advanced architectural foundations faster.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVE COURSE LESSON PLAYER */}
          <div className="lg:col-span-7 bg-[#FCFBF9] border border-stone-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">

            {/* Top Chapter Progress Label Bar */}
            <div className="flex items-center justify-between ">
              <div className="bg-stone-100 text-stone-500 font-mono font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded">
                Active Chapter
              </div>
              {/* Segment Selection Nodes */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveSection(num)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${activeSection === num
                      ? "bg-stone-100 border border-stone-200 text-stone-950 scale-105"
                      : "text-stone-400 hover:text-stone-600 bg-transparent"
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-none mb-2">
                {activeModule?.title || "TypeScript Performance"}
              </h2>
              <p className="text-stone-500 text-xs font-semibold">
                Core Module Type: <span className="text-amber-800 font-bold">{activeModule?.type || "Lesson"}</span> • {activeModule?.duration || "1.8 HRS"}
              </p>
            </div>

            {/* Elegant Black/Dark Video Player */}
            <div className="relative overflow-hidden aspect-video bg-[#0c0a09] rounded-3xl group shadow-sm flex flex-col justify-between p-6">
              <div /> {/* spacing div */}

              {/* Centered Premium Glassy Play Trigger Button */}
              <button
                className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-2xl mx-auto hover:scale-105 transition-transform group-hover:bg-amber-50 cursor-pointer"
                aria-label="Play Lesson Simulation"
              >
                <div className="translate-x-0.5">
                  <Play size={20} className="fill-stone-950 stroke-stone-950 text-stone-950" />
                </div>
              </button>

              {/* Bottom video stats bar */}
              <div className="flex items-center justify-between text-white/90 text-[11px] font-bold font-mono">
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  <Clock size={12} className="text-amber-400" />
                  <span>{activeModule?.duration || "18:42"} Lessons</span>
                </span>
                <span className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">
                  Section {activeIndex + 1} of {totalModulesCount}
                </span>
              </div>
            </div>

            {/* Description box of simulated Segment Content */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/50 text-xs text-stone-600 font-medium leading-relaxed">
              {activeSection === 1 && (
                <>
                  <div className="font-bold text-stone-900 mb-1">Concept Definition & Structures</div>
                  {activeModule?.description || "High level technical summary mapping core constraints dynamically aligned to corporate workflows."}
                </>
              )}
              {activeSection === 2 && (
                <>
                  <div className="font-bold text-stone-900 mb-1">Performance Benchmarks & Profiling</div>
                  Explore execution stack limitations, dynamic RAM leak mitigations, and performance diagnostic pipelines related to this lesson. We examine optimal execution layers mapped strictly.
                </>
              )}
              {activeSection === 3 && (
                <>
                  <div className="font-bold text-stone-900 mb-1">Practical Best Practices & Labs</div>
                  Implement secure enterprise paradigms based on high-integrity pipelines, standard patterns, and structured data migrations suitable for production scale.
                </>
              )}
            </div>
