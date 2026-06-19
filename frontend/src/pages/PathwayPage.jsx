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
