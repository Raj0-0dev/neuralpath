import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  LogOut
} from "lucide-react";

export default function AdminPage() {
  const { user, handleLogOut } = useApp();
  const { t } = useTheme();

  const [activeTab, setActiveTab] = useState("candidates");

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

  const avgReadiness = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.readiness || 0), 0);
    return Math.round(sum / candidates.length);
  }, [candidates]);

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

      <div className="rounded-2xl border p-8 text-center" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
        <p className="text-sm font-semibold" style={{ color: t.textMuted }}>
          Scaffolding successfully loaded. Ready for tab layout integration.
        </p>
      </div>

    </div>
  );
}
