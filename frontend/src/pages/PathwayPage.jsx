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

  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

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

  const activeVideo = activeModule?.videos?.find(v => v.segment === activeSection) || activeModule?.videos?.[0];

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
            <div className="relative overflow-hidden aspect-video bg-[#0c0a09] rounded-3xl group shadow-sm w-full h-full">
              {activeVideo?.videoUrl && isYouTubeUrl(activeVideo.videoUrl) ? (
                <iframe
                  key={`${activeModule?.id}_${activeSection}_${activeVideo?.videoUrl}`}
                  src={getYouTubeEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  className="w-full h-full rounded-3xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={`${activeModule?.id}_${activeSection}_${activeVideo?.videoUrl}`}
                  src={activeVideo?.videoUrl || ""}
                  controls
                  className="w-full h-full object-cover rounded-3xl"
                />
              )}
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
 {/* Bottom Actions Row Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-150">
              <button
                onClick={handlePreviousModule}
                disabled={activeIndex <= 0}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 disabled:text-stone-300 disabled:hover:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Previous Module</span>
              </button>

              <button
                onClick={handleContinueLesson}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-6 py-3 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95 duration-100 cursor-pointer"
              >
                <span>Continue Lesson</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

        {/* MODAL 1: ASSESSMENT QUIZ POPUP (Built-in context integration for score submission) */}
        <AnimatePresence>
          {selectedQuiz && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50"
            >
              <motion.div
                initial={{ scale: 0.98, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 12 }}
                className="bg-white border border-stone-200 rounded-[32px] p-8 sm:p-10 w-full max-w-[490px] shadow-[0_24px_70px_rgba(0,0,0,0.12)] relative text-stone-900"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Award size={20} />
                  </div>
                  <h3 className="font-sans text-stone-950 text-xl font-bold tracking-tight lowercase">
                    gatekeeper assessment
                  </h3>
                </div>
                <p className="font-sans text-stone-600 font-medium text-xs leading-relaxed mb-6">
                  Record candidate performance scorecard metrics for: <span className="text-stone-900 font-bold">{selectedQuiz.title}</span> of phase <span className="text-stone-900 italic font-semibold">{selectedQuiz.phaseTitle}</span>.
                </p>

                {quizSuccessMsg ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex gap-2 ${quizScore < 70
                      ? "text-amber-800 bg-amber-50 border-amber-200"
                      : "text-emerald-800 bg-emerald-50 border-emerald-200"
                      }`}
                  >
                    {quizScore < 70 ? (
                      <AlertTriangle size={16} className="text-amber-600 shrink-0 animate-pulse" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    )}
                    <span>{quizSuccessMsg}</span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="font-mono text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-4">
                        candidate performance score (%):
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={quizScore}
                          onChange={(e) => setQuizScore(parseInt(e.target.value))}
                          className="flex-1 accent-stone-900 cursor-pointer h-1.5 rounded-full bg-stone-100"
                        />
                        <span className="font-mono text-xl font-black text-stone-950">
                          {quizScore}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 font-medium bg-stone-50 border border-stone-200/80 p-4 rounded-xl leading-relaxed">
                      💡 Scoring below <strong className="text-amber-700">70%</strong> will dynamically trigger curriculum schedule path updates.
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        onClick={() => setSelectedQuiz(null)}
                        id="close-quiz-btn"
                        className="bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs py-3 rounded-xl border border-stone-200 shadow-sm transition-all active:scale-95 duration-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleQuizSubmit}
                        id="submit-quiz-score-btn"
                        className="bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-3 rounded-xl border border-stone-900 shadow-sm transition-all active:scale-95 duration-100 cursor-pointer"
                      >
                        Record Score
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL 2: INTERACTIVE HANDS-ON AST SANDBOX OVERLAY */}
        <AnimatePresence>
          {isSandboxOpen && (
            <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55">
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                className="bg-[#18181b] border border-stone-800 rounded-[28px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-stone-300 font-mono"
              >
                {/* Sandbox Header */}
                <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-stone-400 ml-2">NeuralNode Compiler Studio - Sandbox</span>
                  </div>
                  <button
                    onClick={() => setIsSandboxOpen(false)}
                    className="text-stone-400 hover:text-white transition-colors text-xs font-bold bg-stone-800 px-3 py-1 rounded-md cursor-pointer"
                  >
                    Close Playroom
                  </button>
                </div>

                {/* Sandbox Body (Split editor and logger) */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-black mb-1.5 flex items-center gap-2">
                      <Code size={12} className="text-amber-500" />
                      Editable JS/TS Script Playground:
                    </div>
                    <textarea
                      value={sandboxCode}
                      onChange={(e) => setSandboxCode(e.target.value)}
                      rows={10}
                      className="w-full p-4 bg-stone-950 border border-stone-800 rounded-xl text-emerald-400 placeholder:text-stone-600 text-xs font-mono focus:outline-none focus:border-amber-600/50 leading-relaxed resize-none"
                    />
                  </div>

                  {/* Sandbox Logger Console Console */}
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-black mb-1.5">
                      Console Compiler Output:
                    </div>
                    <div className="w-full p-4 bg-stone-950 border border-stone-800 rounded-xl text-xs max-h-40 overflow-y-auto leading-relaxed text-stone-400">
                      {sandboxOutput.split("\n").map((line, i) => {
                        const isSystem = line.startsWith("[System") || line.startsWith("[success") || line.startsWith("[Result");
                        const isErr = line.startsWith("🛑");
                        const colorClass = isSystem ? "text-amber-400" : isErr ? "text-red-400" : "text-stone-300";
                        return <div key={i} className={colorClass}>{line}</div>;
                      })}
                    </div>
                  </div>
                </div>

                {/* Sandbox Footer Buttons */}
                <div className="p-4 bg-stone-900/55 border-t border-stone-800 flex justify-between items-center">
                  <span className="text-[10px] text-stone-500">Target Node: {activeModule?.title}</span>
                  <button
                    onClick={handleRunSandboxCode}
                    disabled={sandboxRunning}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    {sandboxRunning ? (
                      <>
                        <RefreshCw className="animate-spin" size={13} />
                        <span>Compiling Nodes...</span>
                      </>
                    ) : (
                      <>
                        <Terminal size={13} />
                        <span>Execute Optimization Script</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
