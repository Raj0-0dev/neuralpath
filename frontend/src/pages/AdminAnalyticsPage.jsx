import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
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
  Activity,
  Sparkles
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { user } = useApp();
  const { t, isDark } = useTheme();

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skillDeficiencies, setSkillDeficiencies] = useState([]);
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

  const avgReadiness = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.readiness || 0), 0);
    return Math.round(sum / candidates.length);
  }, [candidates]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-6 shadow-sm flex flex-col" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-black tracking-tight" style={{ color: t.textH }}>Skill Gaps Frequency Histogram</h2>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: t.textMuted }}>Count of employees lacking competency across core categories</p>
            </div>
            <span className="p-1.5 rounded-lg border" style={{ backgroundColor: t.tagBg, color: t.outlineStroke, borderColor: t.tagBorder }}>
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
                        fill={isDark 
                          ? (entry.count >= 3 ? "#f59e0b" : entry.count === 2 ? "#fbbf24" : "#fcd34d") 
                          : (entry.count >= 3 ? "#b45309" : entry.count === 2 ? "#d97706" : "#f59e0b")} 
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
            <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-850/30 text-stone-600 dark:text-stone-300 text-[11px] font-semibold border border-dashed" style={{ borderColor: t.border }}>
              <Sparkles className="shrink-0" size={16} style={{ color: t.outlineStroke }} />
              <span><strong>Recommendation:</strong> Organize a team-wide masterclass on <strong>{skillDeficiencies[0]?.skill || "cloud and deployment patterns"}</strong> to solve the team's largest bottleneck.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
