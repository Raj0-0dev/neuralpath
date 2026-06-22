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
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  Search,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";

export default function AdminTalentPage() {
  const { user } = useApp();
  const { t, isDark } = useTheme();

  const [candidateQuery, setCandidateQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalTab, setModalTab] = useState("competency");

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const selectedCandidateBarData = useMemo(() => {
    if (!selectedCandidate) return [];
    
    if (selectedCandidate.skillsWithScores && selectedCandidate.skillsWithScores.length > 0) {
      return selectedCandidate.skillsWithScores.map(s => {
        const readiness = s.score * 10;
        return {
          name: s.name,
          readiness,
          status: s.score >= 8 ? "Mastered" : s.score > 0 ? "In Progress" : "Gap Skill"
        };
      }).sort((a, b) => b.readiness - a.readiness).slice(0, 8);
    }

    const data = [];
    (selectedCandidate.strengths || []).forEach(s => {
      data.push({ name: s, readiness: 80, status: "Mastered" });
    });
    (selectedCandidate.gaps || []).forEach(g => {
      const skillName = typeof g === "object" ? g.skill : g;
      data.push({ name: skillName, readiness: 20, status: "Gap Skill" });
    });
    return data.sort((a, b) => b.readiness - a.readiness).slice(0, 8);
  }, [selectedCandidate]);

  const selectedCandidateAreaData = useMemo(() => {
    if (!selectedCandidate) return [];
    
    const dateCounts = {};
    if (selectedCandidate.activityLog && Array.isArray(selectedCandidate.activityLog)) {
      selectedCandidate.activityLog.forEach(log => {
        if (log.type === "Course" && log.date) {
          dateCounts[log.date] = (dateCounts[log.date] || 0) + 2.5;
        }
      });
    }

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        name: label,
        progress: dateCounts[dateStr] || 0
      });
    }
    return data;
  }, [selectedCandidate]);

  const handleOpenAudit = async (candidate) => {
    setSelectedCandidate(candidate);
    setModalTab("competency");
    
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

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center transition-colors duration-300" style={{ backgroundColor: t.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: t.outlineStroke }}></div>
        <p className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: t.outlineStroke }}>Synchronizing Recruiter Console...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6" style={{ borderColor: t.divider }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg text-white shadow-sm" style={{ backgroundColor: t.outlineStroke }}>
              <Settings size={18} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: t.outlineStroke }}>Recruiter Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: t.textH }}>
            HR Oversight & Admin Panel
          </h1>
          <p className="text-xs md:text-sm font-semibold mt-1" style={{ color: t.textMuted }}>
            System configuration & candidate readiness auditing portal. Logged in as:{" "}
            <span className="font-mono px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border" style={{ backgroundColor: t.tagBg, color: t.tagText, borderColor: t.tagBorder }}>
              {user?.role || "admin"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Active Talent</span>
            <Users size={16} style={{ color: t.outlineStroke }} />
          </div>
          <div className="text-2xl md:text-3xl font-black" style={{ color: t.textH }}>{candidates.length}</div>
          <div className="text-[10px] font-semibold mt-1 text-emerald-500">Pipeline Monitoring Active</div>
        </div>

        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Cohort Readiness</span>
            <TrendingUp size={16} style={{ color: t.outlineStroke }} />
          </div>
          <div className="text-2xl md:text-3xl font-black" style={{ color: t.textH }}>{avgReadiness}%</div>
          <div className="text-[10px] font-semibold mt-1" style={{ color: t.textMuted }}>Target Skill Coverage</div>
        </div>

        <div className="rounded-2xl p-5 border transition-all shadow-sm" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-start text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Configured Roles</span>
            <FileText size={16} style={{ color: t.outlineStroke }} />
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
                  <th className="py-4 px-6" style={{ color: t.textMuted }}>Target Objective</th>
                  <th className="py-4 px-6" style={{ color: t.textMuted }}>Readiness Index</th>
                  <th className="py-4 px-6 text-right" style={{ color: t.textMuted }}>Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-semibold" style={{ divideColor: t.border }}>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-stone-400">
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
                          <div className="w-8 h-8 rounded-full font-black flex items-center justify-center text-xs border" style={{ backgroundColor: t.tagBg, color: t.tagText, borderColor: t.tagBorder }}>
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold" style={{ color: t.textH }}>{candidate.name}</div>
                            <div className="text-[10px] font-mono mt-0.5" style={{ color: t.textMuted }}>{candidate.email}</div>
                          </div>
                        </div>
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
                              className="h-full rounded-full"
                              style={{ 
                                width: `${candidate.readiness || 0}%`,
                                background: `linear-gradient(90deg, ${t.outlineStroke}, ${t.linkText})`
                              }}
                            />
                          </div>
                          <span className="font-black font-mono w-8 text-right" style={{ color: t.textH }}>{candidate.readiness || 0}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenAudit(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg font-bold hover:shadow-sm border border-transparent hover:border-stone-200/50 transition-all cursor-pointer"
                          style={{ color: t.linkText }}
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

      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col justify-between rounded-3xl shadow-2xl overflow-y-auto p-6 md:p-8 border"
              style={{ backgroundColor: t.bgCard, borderColor: t.border }}
            >
              <div>
                <div className="flex justify-between items-start mb-6 border-b pb-4" style={{ borderColor: t.border }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl font-black flex items-center justify-center text-lg border uppercase shadow-sm" style={{ backgroundColor: t.tagBg, color: t.tagText, borderColor: t.tagBorder }}>
                      {selectedCandidate.name.substring(0, 2)}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: t.outlineStroke }}>Candidate Profile Audit</span>
                      <h2 className="text-xl font-black tracking-tight mt-0.5" style={{ color: t.textH }}>{selectedCandidate.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono text-stone-400">{selectedCandidate.email}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border" style={{ backgroundColor: t.tagBg, color: t.tagText, borderColor: t.tagBorder }}>
                          {selectedCandidate.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 border transition-all cursor-pointer shadow-sm"
                    style={{ borderColor: t.border }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-xl border p-4 bg-stone-50/10 dark:bg-stone-850/5 flex flex-col justify-between" style={{ borderColor: t.border }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Readiness Score</span>
                    <div className="text-xl font-black font-mono mt-2" style={{ color: t.outlineStroke }}>{selectedCandidate.readiness || 0}%</div>
                  </div>
                  <div className="rounded-xl border p-4 bg-stone-50/10 dark:bg-stone-850/5 flex flex-col justify-between" style={{ borderColor: t.border }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Extracted Skills</span>
                    <div className="text-xl font-black font-mono mt-2 text-emerald-500">{selectedCandidate.strengths?.length || 0} Skills</div>
                  </div>
                  <div className="rounded-xl border p-4 bg-stone-50/10 dark:bg-stone-850/5 flex flex-col justify-between" style={{ borderColor: t.border }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Target Gaps</span>
                    <div className="text-xl font-black font-mono mt-2 text-rose-500">{selectedCandidate.gaps?.length || 0} Gaps</div>
                  </div>
                  <div className="rounded-xl border p-4 bg-stone-50/10 dark:bg-stone-850/5 flex flex-col justify-between" style={{ borderColor: t.border }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Milestones</span>
                    <div className="text-xl font-black font-mono mt-2 text-indigo-500">{selectedCandidate.activityLog?.length || 0} Met</div>
                  </div>
                </div>

                <div className="flex border-b mb-6 overflow-x-auto" style={{ borderColor: t.divider }}>
                  <button
                    onClick={() => setModalTab("competency")}
                    className={`px-4 py-2.5 text-xs font-black tracking-tight border-b-2 transition-all cursor-pointer ${
                      modalTab === "competency"
                        ? ""
                        : "border-transparent text-stone-500"
                    }`}
                    style={{
                      borderColor: modalTab === "competency" ? t.outlineStroke : "transparent",
                      color: modalTab === "competency" ? t.outlineStroke : undefined
                    }}
                  >
                    Competency Profile
                  </button>
                  <button
                    onClick={() => setModalTab("learning")}
                    className={`px-4 py-2.5 text-xs font-black tracking-tight border-b-2 transition-all cursor-pointer ${
                      modalTab === "learning"
                        ? ""
                        : "border-transparent text-stone-500"
                    }`}
                    style={{
                      borderColor: modalTab === "learning" ? t.outlineStroke : "transparent",
                      color: modalTab === "learning" ? t.outlineStroke : undefined
                    }}
                  >
                    Learning & Activity
                  </button>
                </div>

                {modalTab === "competency" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="rounded-xl border p-4 shadow-sm bg-gradient-to-br from-stone-500/5 to-stone-600/5" style={{ borderColor: t.border }}>
                        <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.outlineStroke }}>Competency Benchmark</div>
                        <p className="text-xs font-semibold leading-relaxed text-stone-500">
                          Auditing employee qualification against standard <strong>{selectedCandidate.targetRole}</strong> requirements.
                        </p>
                      </div>

                      <div>
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

                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: t.textH }}>
                          <AlertCircle className="shrink-0" size={14} style={{ color: t.outlineStroke }} />
                          <span>Target Gaps & Priority</span>
                        </h3>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
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
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-2xl border p-4 bg-stone-50/10 dark:bg-stone-850/5 flex flex-col h-full" style={{ borderColor: t.border }}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: t.textH }}>
                            Required Skill Readiness Profiles
                          </h3>
                          <div className="flex items-center gap-3 text-[9px] font-bold">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600"></span> Mastered</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Gap</span>
                          </div>
                        </div>
                        <div className="h-[280px] w-full text-[10px] flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedCandidateBarData}
                              layout="vertical"
                              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={t.chartGrid || "#f5f5f4"} />
                              <XAxis type="number" domain={[0, 100]} stroke={t.chartAxis || "#a8a29e"} fontSize={9} fontWeight={600} />
                              <YAxis dataKey="name" type="category" stroke={t.chartAxis || "#78716c"} fontSize={9} fontWeight={600} width={80} />
                              <Tooltip
                                cursor={{ fill: isDark ? '#1c1917' : '#fafaf9', opacity: 0.4 }}
                                contentStyle={{
                                  backgroundColor: isDark ? "#1c1917" : "#ffffff",
                                  border: `1px solid ${t.border}`,
                                  borderRadius: "8px",
                                  fontSize: "10px",
                                  color: t.textH,
                                  fontWeight: 650,
                                }}
                              />
                              <Bar dataKey="readiness" radius={[0, 4, 4, 0]} barSize={10}>
                                {selectedCandidateBarData.map((entry, index) => {
                                  let fillColor = "#ef4444";
                                  if (entry.status === "Mastered") {
                                    fillColor = "#059669";
                                  } else if (entry.status === "In Progress") {
                                    fillColor = "#d97706";
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
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "learning" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="rounded-2xl border p-4 bg-stone-50/10 dark:bg-stone-850/5" style={{ borderColor: t.border }}>
                        <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: t.textH }}>
                          Weekly Learning Velocity (Hrs)
                        </h3>
                        <div className="h-[220px] w-full text-[10px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedCandidateAreaData}>
                              <defs>
                                <linearGradient id="colorAuditProgress" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={t.outlineStroke} stopOpacity={0.15} />
                                  <stop offset="95%" stopColor={t.outlineStroke} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid || "#f5f5f4"} />
                              <XAxis dataKey="name" stroke={t.chartAxis || "#a8a29e"} axisLine={false} tickLine={false} fontSize={9} fontWeight={600} />
                              <YAxis hide />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDark ? "#1c1917" : "#ffffff",
                                  border: `1px solid ${t.border}`,
                                  borderRadius: "8px",
                                  fontSize: "10px",
                                  color: t.textH,
                                  fontWeight: 650,
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="progress"
                                stroke={t.outlineStroke}
                                fillOpacity={1}
                                fill="url(#colorAuditProgress)"
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: t.textH }}>
                          <Activity className="shrink-0" size={14} style={{ color: t.outlineStroke }} />
                          <span>Completed Milestones ({selectedCandidate.activityLog?.length || 0})</span>
                        </h3>
                        <div className="border-l-2 pl-4 ml-2 space-y-4 max-h-[220px] overflow-y-auto pr-2" style={{ borderColor: t.border }}>
                          {!selectedCandidate.activityLog || selectedCandidate.activityLog.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">No activity logs captured.</p>
                          ) : (
                            selectedCandidate.activityLog.map((log, idx) => (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: t.outlineStroke, borderColor: t.bgCard }} />
                                <div className="text-[10px] font-bold text-stone-400 font-mono">{log.date} &bull; {log.type}</div>
                                <div className="text-xs font-black mt-0.5" style={{ color: t.textH }}>{log.title}</div>
                                <div className="text-[10px] font-bold font-mono mt-0.5" style={{ color: t.outlineStroke }}>Score Achieved: {log.score}%</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t pt-4" style={{ borderColor: t.border }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-mono text-[11px] font-bold text-center cursor-pointer transition-all"
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
