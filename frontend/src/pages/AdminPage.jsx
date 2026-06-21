import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  Search,
  Eye,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ExternalLink
} from "lucide-react";

export default function AdminPage() {
  const { user, handleLogOut } = useApp();
  const { t, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState("candidates");
  const [candidateQuery, setCandidateQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
  const [skillDeficiencies, setSkillDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleSkills, setNewRoleSkills] = useState([]);

  const [newResSkill, setNewResSkill] = useState("Python");
  const [newResTitle, setNewResTitle] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const [newResType, setNewResType] = useState("video");

  const allSupportedSkills = [
    "Python", "Data Analysis", "Machine Learning", "Deep Learning", 
    "NLP / Large Language Models", "MLOps / Deployment", "Kubernetes / Docker", 
    "Distributed Systems", "System Design", "Cloud Platforms (AWS)", 
    "React / Frontend", "Backend Development", "Database / SQL", 
    "Communication", "Team Leadership", "Project Management", "Agile / Scrum"
  ];

  const fetchAdminData = async () => {
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;

    setLoading(true);
    try {
      const resCand = await fetch("/api/admin/employees", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataCand = await resCand.json();
      if (resCand.ok && dataCand.success) {
        setCandidates(dataCand.data);
      }

      const resRoles = await fetch("/api/admin/roles", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataRoles = await resRoles.json();
      if (resRoles.ok && dataRoles.success) {
        setRoles(dataRoles.data);
      }

      const resRes = await fetch("/api/admin/resources", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataRes = await resRes.json();
      if (resRes.ok && dataRes.success) {
        setResources(dataRes.data);
      }

      const resAnal = await fetch("/api/admin/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataAnal = await resAnal.json();
      if (resAnal.ok && dataAnal.success) {
        setSkillDeficiencies(dataAnal.data.deficiencies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(candidateQuery.toLowerCase()) ||
                            c.email.toLowerCase().includes(candidateQuery.toLowerCase()) ||
                            c.company.toLowerCase().includes(candidateQuery.toLowerCase());
      
      const matchesRole = selectedRoleFilter === "all" || c.targetRole === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, candidateQuery, selectedRoleFilter]);

  const avgReadiness = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.readiness || 0), 0);
    return Math.round(sum / candidates.length);
  }, [candidates]);

  const handleOpenAudit = async (candidate) => {
    setSelectedCandidate(candidate);
    
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/employees/${candidate.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedCandidate(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExitSession = () => {
    handleLogOut();
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newRoleTitle,
          description: newRoleDesc,
          requiredSkills: newRoleSkills
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoles([...roles, data.data]);
        setNewRoleTitle("");
        setNewRoleDesc("");
        setNewRoleSkills([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRole = async (id) => {
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRoles(roles.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkillToggleInNewRole = (skill) => {
    if (newRoleSkills.includes(skill)) {
      setNewRoleSkills(newRoleSkills.filter(s => s !== skill));
    } else {
      setNewRoleSkills([...newRoleSkills, skill]);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          skillName: newResSkill,
          title: newResTitle,
          url: newResUrl,
          videoUrl: newResUrl,
          type: newResType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResources([...resources, data.data]);
        setNewResTitle("");
        setNewResUrl("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (id) => {
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center transition-colors duration-300" style={{ backgroundColor: t.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase">Synchronizing Recruiter Console...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6" style={{ borderColor: t.divider }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-amber-500 text-white shadow-sm">
              <Settings size={18} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">Recruiter Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: t.textH }}>
            HR Oversight & Admin Panel
          </h1>
          <p className="text-xs md:text-sm font-semibold mt-1" style={{ color: t.textMuted }}>
            System configuration & candidate readiness auditing portal. Logged in as:{" "}
            <span className="font-mono bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
              {user?.role || "admin"}
            </span>
          </p>
        </div>

        <button 
          id="admin-logout-btn"
          onClick={handleExitSession}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-850 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-mono text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all border border-stone-800/20 shadow-sm cursor-pointer"
        >
          <LogOut size={13} />
          <span>Exit Session</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Active Talent</span>
            <Users size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black" style={{ color: t.textH }}>{candidates.length}</div>
          <div className="text-[10px] font-semibold mt-1 text-emerald-500">Pipeline Monitoring Active</div>
        </div>

        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Cohort Readiness</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black" style={{ color: t.textH }}>{avgReadiness}%</div>
          <div className="text-[10px] font-semibold mt-1" style={{ color: t.textMuted }}>Target Skill Coverage</div>
        </div>

        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Configured Roles</span>
            <FileText size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black" style={{ color: t.textH }}>{roles.length}</div>
          <div className="text-[10px] font-semibold mt-1" style={{ color: t.textMuted }}>Competency Benchmarks</div>
        </div>

        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Engine Status</span>
            <Database size={16} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="text-sm font-bold flex items-center gap-2 py-1.5" style={{ color: t.textH }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span className="text-emerald-500 font-mono tracking-wider">SYNC_SUCCESS</span>
          </div>
          <div className="text-[10px] font-semibold" style={{ color: t.textMuted }}>Connection Health OK</div>
        </div>
      </div>

      <div className="flex border-b mb-6 overflow-x-auto pb-px" style={{ borderColor: t.divider }}>
        <button
          id="tab-candidates"
          onClick={() => setActiveTab("candidates")}
          className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "candidates"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
          }`}
        >
          Talent Directory ({candidates.length})
        </button>
        <button
          id="tab-analytics"
          onClick={() => setActiveTab("analytics")}
          className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "analytics"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
          }`}
        >
          Cohort Analytics
        </button>
        <button
          id="tab-roles"
          onClick={() => setActiveTab("roles")}
          className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "roles"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
          }`}
        >
          Competency Models
        </button>
        <button
          id="tab-resources"
          onClick={() => setActiveTab("resources")}
          className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "resources"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
          }`}
        >
          Curriculum Resources
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "candidates" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border items-center" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="search-candidates"
                  type="text"
                  placeholder="Search candidate directory (name, email, company)..."
                  value={candidateQuery}
                  onChange={(e) => setCandidateQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-lg border outline-none transition-all"
                  style={{ 
                    backgroundColor: t.bgInput, 
                    borderColor: t.borderInput, 
                    color: t.inputText
                  }}
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: t.textMuted }}>Target Role:</span>
                <select
                  id="filter-role"
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none w-full md:w-auto cursor-pointer"
                  style={{ 
                    backgroundColor: t.selectBg, 
                    borderColor: t.borderInput, 
                    color: t.selectText 
                  }}
                >
                  <option value="all">All Mapped Roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: t.border, backgroundColor: t.bgStep }}>
                      <th className="py-4 px-6" style={{ color: t.textMuted }}>Candidate Info</th>
                      <th className="py-4 px-6" style={{ color: t.textMuted }}>Company / Account</th>
                      <th className="py-4 px-6" style={{ color: t.textMuted }}>Target Objective</th>
                      <th className="py-4 px-6" style={{ color: t.textMuted }}>Readiness Index</th>
                      <th className="py-4 px-6 text-right" style={{ color: t.textMuted }}>Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs font-semibold" style={{ divideColor: t.border }}>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users size={32} className="text-stone-300 dark:text-stone-700" />
                            <span>No candidate profiles match current filters.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/10 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black flex items-center justify-center text-xs border border-amber-200/50">
                                {candidate.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold" style={{ color: t.textH }}>{candidate.name}</div>
                                <div className="text-[10px] font-mono mt-0.5" style={{ color: t.textMuted }}>{candidate.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6" style={{ color: t.textBody }}>
                            {candidate.company}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/40">
                              {candidate.targetRole}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3 w-40">
                              <div className="flex-1 bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-200/30">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                                  style={{ width: `${candidate.readiness || 0}%` }}
                                />
                              </div>
                              <span className="font-black font-mono w-8 text-right" style={{ color: t.textH }}>{candidate.readiness || 0}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleOpenAudit(candidate)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg text-amber-600 dark:text-amber-400 font-bold hover:shadow-sm border border-transparent hover:border-stone-200/50 transition-all cursor-pointer"
                              title="Open Metrics Drawer"
                            >
                              <Eye size={13} />
                              <span>Audit Metrics</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border p-6 shadow-sm flex flex-col" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-black tracking-tight" style={{ color: t.textH }}>Skill Gaps Frequency Histogram</h2>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: t.textMuted }}>Count of employees lacking competency across core categories</p>
                </div>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-200/20">
                  <Activity size={16} />
                </span>
              </div>

              <div className="h-80 w-full text-[10px]">
                {skillDeficiencies.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-400 italic">
                    No cohort deficiencies recorded. Ensure candidates have active gap analyses.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillDeficiencies}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
                      <XAxis 
                        dataKey="skill" 
                        stroke={t.chartAxis}
                        tickLine={false}
                        axisLine={false}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke={t.chartAxis} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1c1917" : "#ffffff",
                          borderColor: t.border,
                          borderRadius: "12px",
                          fontFamily: "monospace",
                          color: isDark ? "#FAF9F6" : "#1c1917",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {skillDeficiencies.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.count >= 3 ? "#d97706" : entry.count === 2 ? "#f59e0b" : "#fbbf24"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              <div>
                <h2 className="text-base font-black tracking-tight mb-4" style={{ color: t.textH }}>Priority Deficiencies</h2>
                <div className="space-y-4">
                  {skillDeficiencies.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No deficiencies found across cohort.</p>
                  ) : (
                    skillDeficiencies.slice(0, 5).map((def) => {
                      const score = def.count;
                      let badgeColor = "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200/40";
                      let priorityLabel = "Medium Gap Frequency";

                      if (score >= 3) {
                         badgeColor = "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/40";
                         priorityLabel = "High Critical Defect";
                      } else if (score === 1) {
                         badgeColor = "bg-amber-50/50 dark:bg-amber-950/10 text-amber-500 dark:text-amber-400 border-amber-100/20";
                         priorityLabel = "Isolated Defect";
                      }

                      return (
                        <div key={def.skill} className="flex justify-between items-center p-3 rounded-xl border" style={{ borderColor: t.border }}>
                          <div>
                            <div className="text-xs font-extrabold" style={{ color: t.textH }}>{def.skill}</div>
                            <span className="text-[9px] font-bold mt-0.5 block uppercase tracking-wider text-stone-400">{priorityLabel}</span>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-black border ${badgeColor}`}>
                            {score} {score === 1 ? "User" : "Users"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-6 border-t pt-4" style={{ borderColor: t.border }}>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/30 text-stone-600 dark:text-stone-300 text-[11px] font-semibold border border-dashed" style={{ borderColor: t.border }}>
                  <Sparkles className="text-amber-500 shrink-0" size={16} />
                  <span><strong>Recommendation:</strong> Organize a team-wide masterclass on <strong>{skillDeficiencies[0]?.skill || "cloud and deployment patterns"}</strong> to solve the team's largest bottleneck.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-black tracking-tight mb-2" style={{ color: t.textH }}>Active Competency Benchmarks</h2>
              
              {roles.map((role) => (
                <div key={role.id} className="rounded-2xl border p-6 shadow-sm relative group" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500">{role.title}</h3>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: t.textBody }}>{role.description}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Role Model"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {role.requiredSkills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border"
                        style={{ 
                          backgroundColor: t.tagBg, 
                          color: t.tagText, 
                          borderColor: t.tagBorder 
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-6 shadow-sm h-fit" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              <h2 className="text-base font-black tracking-tight mb-4" style={{ color: t.textH }}>Add Competency Profile</h2>
              
              <form onSubmit={handleAddRole} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Role Title</label>
                  <input
                    id="new-role-title"
                    type="text"
                    placeholder="e.g. Lead DevOps Engineer"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                    style={{ 
                      backgroundColor: t.bgInput, 
                      borderColor: t.borderInput, 
                      color: t.inputText 
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Description</label>
                  <textarea
                    id="new-role-desc"
                    placeholder="Specify role targets..."
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none resize-none"
                    style={{ 
                      backgroundColor: t.bgInput, 
                      borderColor: t.borderInput, 
                      color: t.inputText 
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: t.textMuted }}>Map Required Skills</label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2.5 space-y-1.5" style={{ borderColor: t.border }}>
                    {allSupportedSkills.map((skill) => {
                      const isChecked = newRoleSkills.includes(skill);
                      return (
                        <label key={skill} className="flex items-center gap-2 text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSkillToggleInNewRole(skill)}
                            className="rounded accent-amber-500 outline-none border cursor-pointer"
                          />
                          <span>{skill}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  id="submit-role-btn"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Save Competency Model</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black tracking-tight" style={{ color: t.textH }}>Active Study Material</h2>
                <p className="text-[11px] font-semibold mt-0.5 text-stone-400">Content mapped automatically to candidate competency gaps</p>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {resources.map((res) => (
                  <div key={res.id} className="rounded-xl border p-4 shadow-sm relative group flex justify-between items-center" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border border-amber-200/20">
                          {res.skillName}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                          {res.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-black mt-1.5" style={{ color: t.textH }}>{res.title}</h4>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-semibold flex items-center gap-1 mt-1 text-amber-500 hover:underline"
                      >
                        <ExternalLink size={10} />
                        <span>Access Content Link</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                <h3 className="text-xs font-black uppercase tracking-wider mb-4" style={{ color: t.textH }}>Bind Study Resource</h3>
                <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Map to Skill</label>
                    <select
                      value={newResSkill}
                      onChange={(e) => setNewResSkill(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none cursor-pointer"
                      style={{ backgroundColor: t.selectBg, borderColor: t.borderInput, color: t.selectText }}
                    >
                      {allSupportedSkills.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Resource Type</label>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none cursor-pointer"
                      style={{ backgroundColor: t.selectBg, borderColor: t.borderInput, color: t.selectText }}
                    >
                      <option value="video">Theory Video</option>
                      <option value="doc">Concept Document</option>
                      <option value="project">Practical Lab</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Resource Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Database Patterns Course"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                      style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>URL / File Link</label>
                    <input
                      type="url"
                      placeholder="https://acme.academy/course"
                      value={newResUrl}
                      onChange={(e) => setNewResUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                      style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Bind Study Resource</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-base font-black tracking-tight" style={{ color: t.textH }}>Upskilling Workshops</h2>
                <p className="text-[11px] font-semibold mt-0.5 text-stone-400">Scheduled synchronous lectures and interactive sessions</p>
              </div>

              <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/20 text-amber-500 font-black flex items-center justify-center text-sm border border-amber-200/50 mx-auto mb-4 animate-pulse">
                  <Calendar size={20} />
                </div>
                <h4 className="text-sm font-black mb-2" style={{ color: t.textH }}>Workshops Coming Soon</h4>
                <p className="text-xs leading-relaxed text-stone-500 max-w-xs mx-auto mb-4">
                  In the next release, recruiters will be able to schedule live, interactive peer upskilling sessions synced with employee gap calendars.
                </p>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold uppercase rounded-lg border border-amber-500/20 tracking-wider">
                  Postponed / Phase 3
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-stone-900"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg h-full flex flex-col justify-between shadow-2xl overflow-y-auto p-6 md:p-8"
              style={{ backgroundColor: t.bgCard, borderLeft: `1px solid ${t.border}` }}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black flex items-center justify-center text-base border border-amber-200/50 mb-3 uppercase">
                      {selectedCandidate.name.substring(0, 2)}
                    </div>
                    <h2 className="text-lg font-black tracking-tight" style={{ color: t.textH }}>{selectedCandidate.name}</h2>
                    <p className="text-[11px] font-mono mt-0.5" style={{ color: t.textMuted }}>{selectedCandidate.email}</p>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black bg-stone-100 dark:bg-stone-800 text-stone-500 uppercase border border-stone-200/40 tracking-wider inline-block mt-2">
                      {selectedCandidate.company}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 border transition-all cursor-pointer"
                    style={{ borderColor: t.border }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="rounded-xl border p-4 mb-6 shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-600/5" style={{ borderColor: t.border }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">Readiness Score</span>
                    <span className="text-base font-black font-mono text-amber-600 dark:text-amber-500">{selectedCandidate.readiness || 0}%</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden border border-stone-200/30 mb-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                      style={{ width: `${selectedCandidate.readiness || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-stone-400">
                    Candidate has completed the major core requisites for <strong>{selectedCandidate.targetRole}</strong>.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: t.textH }}>
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />
                    <span>Identified Strengths ({selectedCandidate.strengths?.length || 0})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {!selectedCandidate.strengths || selectedCandidate.strengths.length === 0 ? (
                      <span className="text-xs text-stone-400 italic">None detected.</span>
                    ) : (
                      selectedCandidate.strengths.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: t.textH }}>
                    <AlertCircle className="text-amber-500 shrink-0" size={14} />
                    <span>Target Gaps & Priority</span>
                  </h3>
                  <div className="space-y-2">
                    {!selectedCandidate.gaps || selectedCandidate.gaps.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No competency gaps identified for this candidate.</p>
                    ) : (
                      selectedCandidate.gaps.map(g => {
                        let priorityBadge = "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/30";
                        if (g.priority === "medium") {
                          priorityBadge = "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200/30";
                        } else if (g.priority === "low") {
                          priorityBadge = "bg-stone-50 dark:bg-stone-800 text-stone-500 border-stone-200/30";
                        }
                        
                        return (
                          <div key={g.skill} className="flex justify-between items-center p-3 rounded-xl border bg-stone-50/30 dark:bg-stone-850/10" style={{ borderColor: t.border }}>
                            <div>
                              <div className="text-xs font-extrabold" style={{ color: t.textH }}>{g.skill}</div>
                              <div className="text-[10px] text-stone-400 font-mono mt-0.5">Progress: {g.current}% &rarr; Target: {g.required}%</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider ${priorityBadge}`}>
                              {g.priority}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: t.textH }}>
                    <Activity className="text-amber-500 shrink-0" size={14} />
                    <span>Completed Milestones ({selectedCandidate.activityLog?.length || 0})</span>
                  </h3>
                  <div className="border-l-2 pl-4 ml-2 space-y-4" style={{ borderColor: t.border }}>
                    {!selectedCandidate.activityLog || selectedCandidate.activityLog.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No activity logs captured.</p>
                    ) : (
                      selectedCandidate.activityLog.map((log, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2" style={{ borderColor: t.bgCard }} />
                          <div className="text-[10px] font-bold text-stone-400 font-mono">{log.date} &bull; {log.type}</div>
                          <div className="text-xs font-black mt-0.5" style={{ color: t.textH }}>{log.title}</div>
                          <div className="text-[10px] font-bold text-amber-500 font-mono mt-0.5">Score Achieved: {log.score}%</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 border-t pt-4" style={{ borderColor: t.border }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-mono text-[11px] font-bold text-center cursor-pointer transition-all"
                >
                  Close Audit Feed
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
