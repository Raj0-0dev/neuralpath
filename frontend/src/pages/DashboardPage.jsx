import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  ChevronRight,
  Plus,
  Compass,
  Brain,
  AlertTriangle,
  Layers,
  Shield,
  CheckCircle2,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

const SKILL_DATA = [
  { subject: "React", A: 120, fullMark: 150 },
  { subject: "Node.js", A: 98, fullMark: 150 },
  { subject: "TypeScript", A: 115, fullMark: 150 },
  { subject: "System Design", A: 99, fullMark: 150 },
  { subject: "Cloud Native", A: 85, fullMark: 150 },
  { subject: "GraphQL", A: 65, fullMark: 150 },
];

export default function DashboardPage() {
  const { isLoggedIn, profile, pathway, completedModules, dailyHours, analysis } = useApp();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("np-mock-user-token");
        const res = await fetch("/api/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        }

        const payload = await res.json();
        if (payload.success) {
          setDashboardData(payload.data);
        } else {
          throw new Error(payload.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="pt-6 md:pt-20 pb-16 px-4 md:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-5 relative">
        <Compass size={48} className="text-amber-600" />
        <p className="font-sans text-stone-600 font-medium text-base">
          please sign-in to access candidate analytics dashboards.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-stone-900 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-stone-850 transition-all active:scale-95 duration-100 border border-stone-100 shadow-sm cursor-pointer"
        >
          Sign-In Portal
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="pt-6 md:pt-20 pb-16 px-4 md:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-5 relative">
        <Compass size={48} className="text-amber-600 animate-pulse" />
        <h3 className="font-sans text-stone-950 text-2xl font-black lowercase tracking-tight">
          no assessment data active
        </h3>
        <p className="font-sans text-stone-600 font-medium text-sm text-center max-w-sm leading-relaxed">
          please go to the upload page and assess your resume first to activate candidate analytics dashboard.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="bg-stone-900 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-stone-850 transition-all active:scale-95 duration-100 border border-stone-100 shadow-sm cursor-pointer"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  // Format Dynamic 7-day Hours data
  const formatDailyHoursData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        name: label,
        progress: dailyHours[dateString] || 0,
      });
    }
    return data;
  };

  const chartData = formatDailyHoursData();
  const totalHoursTally = Object.values(dailyHours).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  const totalModulesCount = pathway?.phases.reduce((acc, p) => acc + p.modules.length, 0) || 0;
  const allModulesList = pathway?.phases?.flatMap((p) => p.modules) || [];
  const completedModulesCount = allModulesList.filter((mod) => {
    const totalVids = mod.videos?.length || 1;
    for (let s = 1; s <= totalVids; s++) {
      if (!completedModules.has(`${mod.id}_${s}`)) {
        return false;
      }
    }
    return true;
  }).length;
  const calcCompetency = totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

  // Extract completed skill names in real-time
  const completedSkillNames = new Set(
    pathway?.phases?.flatMap(phase => phase.modules)
      .filter(mod => {
        const totalVids = mod.videos?.length || 1;
        for (let s = 1; s <= totalVids; s++) {
          if (!completedModules.has(`${mod.id}_${s}`)) {
            return false;
          }
        }
        return true;
      })
      .map(mod => mod.skillName?.toLowerCase())
      .filter(Boolean) || []
  );

  const targetSkillsList = (dashboardData && Array.isArray(dashboardData.skillsWithScores))
    ? dashboardData.skillsWithScores
    : (analysis?.skillsWithScores || []);

  const totalRequiredSkillsCount = targetSkillsList.length || 1;
  const currentMatchingSkillsCount = targetSkillsList.filter(skill => {
    const isCompleted = completedSkillNames.has(skill.name.toLowerCase());
    return skill.score > 0 || isCompleted;
  }).length;

  const competencyVal = Math.round((currentMatchingSkillsCount / totalRequiredSkillsCount) * 100);

  const skillChartData = targetSkillsList.length > 0
    ? targetSkillsList.map(skill => {
      const isCompleted = completedSkillNames.has(skill.name.toLowerCase());
      const score = isCompleted ? Math.max(skill.score, 8) : skill.score;
      return {
        subject: skill.name,
        A: score * 15,
        fullMark: 150
      };
    })
    : SKILL_DATA;

  // Dynamic status extraction logic for the new visual elements
  const rawMissingSkills = (dashboardData && Array.isArray(dashboardData.missingSkills))
    ? dashboardData.missingSkills
    : (analysis?.gaps || []);

  const missingSkillsList = rawMissingSkills.filter(skillName =>
    !completedSkillNames.has(skillName.toLowerCase())
  );

  const currentSkillsList = analysis?.extractedSkills || [
    "React", "Node.js", "TypeScript", "JavaScript", "HTML5", "CSS3"
  ];

  // Original matching skills (current skills not in gaps)
  const initialMatchingSkillsList = currentSkillsList.filter(skill =>
    !rawMissingSkills.some(ms =>
      ms.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(ms.toLowerCase())
    )
  );

  // Dynamically include newly completed skills from pathway in matches
  const newlyCompletedSkillsList = targetSkillsList
    .filter(skill => completedSkillNames.has(skill.name.toLowerCase()))
    .map(skill => skill.name);

  const matchingSkillsList = [...new Set([...initialMatchingSkillsList, ...newlyCompletedSkillsList])];

  const missingCount = missingSkillsList.length;
  const skillsCount = matchingSkillsList.length;

  const readinessEstimate = competencyVal >= 85 ? "Optimal Fit" :
    competencyVal >= 70 ? "Lead Ready" :
      competencyVal >= 50 ? "Adapting" : "Gap Alert";

  // Target Role Alignment pipeline steps
  const pipelineSteps = [
    { label: "Profile Setup", description: "Auth and account active", completed: isLoggedIn, active: false },
    { label: "Credentials Parsed", description: skillsCount > 0 ? `${skillsCount} skills mapped` : "No resume uploaded", completed: skillsCount > 0, active: isLoggedIn && skillsCount === 0 },
    { label: "Gap Analysis", description: dashboardData ? "API metrics ready" : "Awaiting matcher", completed: !!dashboardData, active: skillsCount > 0 && !dashboardData },
    { label: "Roadmap Active", description: pathway?.phases?.length ? "Learning path open" : "Generating phases", completed: !!pathway?.phases?.length, active: !!dashboardData && !pathway?.phases?.length },
    { label: "Role Alignment", description: competencyVal >= 80 ? "Optimal alignment" : `${competencyVal}% match`, completed: competencyVal >= 80, active: !!pathway?.phases?.length && competencyVal < 80 }
  ];

  // Dynamic skill readiness data for the bar chart comparison
  const barChartData = (() => {
    const sourceList = (dashboardData && Array.isArray(dashboardData.skillsWithScores) && dashboardData.skillsWithScores.length > 0)
      ? dashboardData.skillsWithScores
      : (analysis && Array.isArray(analysis.skillsWithScores) && analysis.skillsWithScores.length > 0)
        ? analysis.skillsWithScores
        : null;

    if (sourceList) {
      return sourceList.map(skill => {
        const isCompleted = completedSkillNames.has(skill.name.toLowerCase());
        const score = isCompleted ? Math.max(skill.score, 8) : skill.score;
        const readiness = score * 10;
        let status = "Gap Skill";
        if (score >= 8) {
          status = "Mastered";
        } else if (score > 0) {
          status = "In Progress";
        }
        return {
          name: skill.name,
          readiness,
          status,
          reason: isCompleted ? "Successfully completed via learning pathway!" : skill.reason
        };
      }).sort((a, b) => b.readiness - a.readiness).slice(0, 8);
    }

    return [
      { name: "React", readiness: 95, status: "Mastered", reason: "Demonstrated production React usage" },
      { name: "TypeScript", readiness: 90, status: "Mastered", reason: "Advanced type typing" },
      { name: "Node.js", readiness: 80, status: "Mastered", reason: "Backend server experience" },
      { name: "System Design", readiness: 55, status: "In Progress", reason: "Minor scaling projects" },
      { name: "Cloud Native", readiness: 40, status: "In Progress", reason: "Basic container exposure" },
      { name: "GraphQL", readiness: 0, status: "Gap Skill", reason: "No GraphQL evidence" },
    ];
  })();

  const stats = [
    { label: "Target Skill Match", value: `${competencyVal}%`, icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Current Skills", value: `${skillsCount} Active`, icon: Brain, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Identified Gaps", value: `${missingCount} Pending`, icon: AlertTriangle, color: "text-rose-700", bg: "bg-rose-50" },
    { label: "Accomplished study", value: `${totalHoursTally.toFixed(1)} hrs`, icon: Award, color: "text-amber-800", bg: "bg-amber-50" },
    { label: "Direct Modules", value: `${completedModulesCount} / ${totalModulesCount}`, icon: BookOpen, color: "text-stone-800", bg: "bg-stone-100" },
    { label: "Readiness Rating", value: readinessEstimate, icon: Shield, color: "text-indigo-700", bg: "bg-indigo-50" },
  ];

  return (
    <div className="pt-6 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 relative">
      {/* Header section identical layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Onboarding Dashboard</h1>
          <p className="text-stone-500 text-sm font-semibold mt-1">
            Analyzing your path to <span className="text-amber-700 font-bold">{pathway?.targetRole || "Principal Technical Lead"}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white font-bold rounded-full hover:bg-stone-850 transition-all text-xs shadow-sm shadow-stone-950/10 cursor-pointer"
          >
            <Plus size={14} />
            <span>Analyze Gap</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-stone-650 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <IconComponent size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Target Role Alignment Pipeline Stepper Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[32px] bg-white border border-stone-200"
      >
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase text-stone-650 tracking-wider">Target Role Alignment Pipeline</h3>
          <p className="text-stone-700 text-xs font-semibold">Real-time status tracking of candidate qualification mapping stages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {pipelineSteps.map((step, idx) => {
            const isDone = step.completed;
            const isActive = step.active;
            return (
              <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left relative group">
                {idx < 4 && (
                  <div className="hidden md:block absolute top-4 left-10 w-full h-[2px] bg-stone-100 z-0">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500"
                      style={{ width: isDone ? "100%" : "0%" }}
                    />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center md:items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${isDone ? "bg-emerald-600 border-emerald-600 text-white" :
                    isActive ? "bg-amber-600 border-amber-600 text-white animate-pulse" :
                      "bg-white border-stone-300 text-stone-650"
                    }`}>
                    {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <h4 className={`text-xs font-extrabold uppercase mt-3 tracking-wider ${isDone ? "text-stone-900" : isActive ? "text-amber-600 animate-pulse" : "text-stone-600"}`}>
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-stone-700 font-semibold mt-1 leading-normal max-w-[150px]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Charts section with custom styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Radar Competencies */}
        <div className="p-6 rounded-[32px] bg-white border border-stone-200">
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase text-stone-655 tracking-wider">Estimated Core Skill Strengths</h3>
            <p className="text-stone-700 text-xs font-semibold">Granular coverage based on parsed experience profile</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillChartData}>
                <PolarGrid stroke="#e5e5e0" />
                <PolarAngleAxis dataKey="subject" stroke="#78716c" fontSize={11} fontWeight={600} />
                <Radar
                  name="Subject competence"
                  dataKey="A"
                  stroke="#1c1917"
                  fill="#78716c"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Learning Velocity Area Chart */}
        <div className="p-6 rounded-[32px] bg-white border border-stone-200">
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase text-stone-655 tracking-wider">Weekly Learning Velocity</h3>
            <p className="text-stone-700 text-xs font-semibold">Onboarding activity tracked and mapped automatically from study milestones</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#78716c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#78716c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#a8a29e" axisLine={false} tickLine={false} fontSize={10} fontWeight={600} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e0",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#1c1917",
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: "#1c1917" }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#1c1917"
                  fillOpacity={1}
                  fill="url(#colorProgress)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Skill Readiness Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[32px] bg-white border border-stone-200"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase text-stone-400 tracking-wider">Required Skill Readiness Profiles</h3>
            <p className="text-stone-500 text-xs font-semibold">Granular comparison of matching and gap skills relative to target role requirements</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Mastered</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> In Progress</span>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
              <XAxis type="number" domain={[0, 100]} stroke="#a8a29e" fontSize={10} fontWeight={600} />
              <YAxis dataKey="name" type="category" stroke="#78716c" fontSize={11} fontWeight={600} />
              <Tooltip
                cursor={{ fill: '#fafaf9' }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e5e0",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#1c1917",
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="readiness" radius={[0, 8, 8, 0]} barSize={14}>
                {barChartData.map((entry, index) => {
                  let fillColor = "#ef4444"; // Red for Gap Skill
                  if (entry.status === "Mastered") {
                    fillColor = "#059669"; // Green
                  } else if (entry.status === "In Progress") {
                    fillColor = "#d97706"; // Amber
                  }
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>


    </div>
  );
}
