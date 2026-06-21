import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  Search,
  Eye,
  LogOut
} from "lucide-react";

export default function AdminPage() {
  const { user, handleLogOut } = useApp();
  const { t } = useTheme();

  const [activeTab, setActiveTab] = useState("candidates");
  const [candidateQuery, setCandidateQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
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
      console.error("Error fetching admin data:", err);
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

  const handleOpenAudit = (candidate) => {
    console.log("Auditing candidate profile:", candidate.name);
  };

  const handleExitSession = () => {
    handleLogOut();
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
            <Database size={16} className="text-emerald-500" />
          </div>
          <div className="text-sm font-bold flex items-center gap-2 py-1.5" style={{ color: t.textH }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
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
                        <tr key={candidate.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/10 transition-colors">
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

        {activeTab !== "candidates" && (
          <div className="p-8 rounded-2xl border text-center" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
            {activeTab === "analytics" && <p className="text-xs text-stone-500 font-semibold">Cohort Analytics Placeholder Content</p>}
            {activeTab === "roles" && <p className="text-xs text-stone-500 font-semibold">Competency Models Placeholder Content</p>}
            {activeTab === "resources" && <p className="text-xs text-stone-500 font-semibold">Curriculum Resources Placeholder Content</p>}
          </div>
        )}
      </div>

    </div>
  );
}
