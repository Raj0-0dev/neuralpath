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
  Compass
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
  const { isLoggedIn, profile, pathway, completedModules, dailyHours } = useApp();
  const navigate = useNavigate();

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
  const completedModulesCount = completedModules.size;
  const calcCompetency = totalModulesCount > 0 ? Math.round((completedModulesCount / totalModulesCount) * 100) : 0;

  // Next steps or recommended modules (modules that are not completed yet)
  const pendingModules = [];
  if (pathway?.phases) {
    for (const phase of pathway.phases) {
      for (const mod of phase.modules) {
        if (!completedModules.has(mod.id)) {
          pendingModules.push({
            tag: mod.type || "Module",
            title: mod.title,
            duration: mod.duration || "30 mins",
            difficulty: mod.level || "Intermediate",
          });
        }
      }
    }
  }

  // Fallback next steps if list is empty
  const recommendedSteps = pendingModules.length > 0 ? pendingModules.slice(0, 3) : [
    { tag: "Database Partitioning", title: "Mastering Redis & Memcached Ring Topologies", duration: "45 mins", difficulty: "Intermediate" },
    { tag: "DevSecOps", title: "Securing Pipelines with CloudKMS & Kubernetes Secrets", duration: "1.2 hours", difficulty: "Advanced" },
    { tag: "Architecture", title: "Complex Distributed Event Stream Consensus & Raft Protocols", duration: "50 mins", difficulty: "Core Mastery" },
  ];

  const stats = [
    { label: "Calculated Competency", value: `${calcCompetency}%`, icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Accomplished study", value: `${totalHoursTally.toFixed(1)} hrs`, icon: Award, color: "text-amber-800", bg: "bg-amber-50" },
    { label: "Time Spent Lessons", value: `${(totalHoursTally * 0.8).toFixed(1)} hrs`, icon: Clock, color: "text-stone-800", bg: "bg-stone-100" },
    { label: "Direct Roadmap Modules", value: `${completedModulesCount} / ${totalModulesCount}`, icon: BookOpen, color: "text-stone-800", bg: "bg-stone-100" },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <IconComponent size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts section with custom styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Radar Competencies */}
        <div className="p-6 rounded-[32px] bg-white border border-stone-200">
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase text-stone-400 tracking-wider">Estimated Core Skill Strengths</h3>
            <p className="text-stone-500 text-xs font-semibold">Granular coverage based on parsed experience profile</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_DATA}>
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
            <h3 className="text-sm font-bold uppercase text-stone-400 tracking-wider">Weekly Learning Velocity</h3>
            <p className="text-stone-500 text-xs font-semibold">Onboarding activity tracked and mapped automatically from study milestones</p>
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

      {/* Suggested next steps list identical design */}
      <div className="p-6 rounded-[32px] bg-white border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase text-stone-400 tracking-wider">Recommended Bridge Modules</h3>
            <p className="text-stone-500 text-xs font-semibold">Priority roadmap actions selected to target identified skill weaknesses</p>
          </div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full">
            AI Recommendations
          </span>
        </div>

        <div className="space-y-3">
          {recommendedSteps.map((task, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-white border border-stone-200/50 hover:border-stone-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-stone-900 rounded-full" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      {task.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-400">{task.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-stone-800 text-sm">{task.title}</h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-xs font-bold text-stone-400 font-mono">{task.duration}</span>
                <ChevronRight 
                  size={16} 
                  className="text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
