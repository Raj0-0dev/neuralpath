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
  Plus,
  Trash2,
  Edit2,
  X
} from "lucide-react";

export default function AdminRolesPage() {
  const { user } = useApp();
  const { t } = useTheme();

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleSkills, setNewRoleSkills] = useState([]);

  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleTitle, setEditingRoleTitle] = useState("");
  const [editingRoleDesc, setEditingRoleDesc] = useState("");
  const [editingRoleSkills, setEditingRoleSkills] = useState([]);

  const [newRoleSkillSearch, setNewRoleSkillSearch] = useState("");
  const [editRoleSkillSearch, setEditRoleSkillSearch] = useState("");

  const allSupportedSkills = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "State Management",
    "Node.js", "Express", "REST API", "MongoDB", "SQL", "System Design",
    "Git", "Docker", "Linux", "Kubernetes", "CI/CD", "AWS",
    "Terraform", "Bash", "Data Structures", "Algorithms", "Python", "Machine Learning",
    "Pandas", "NumPy", "Statistics", "Data Visualization", "Technical Sourcing", "Boolean Search",
    "Industry Knowledge", "Screening", "Interviewing", "Offer Management", "Negotiation", "Talent Acquisition"
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const allCurriculumCategories = useMemo(() => {
    const categories = new Set();
    allSupportedSkills.forEach(skill => categories.add(skill));
    resources.forEach(res => {
      const exists = Array.from(categories).some(
        c => c.toLowerCase() === res.skillName.toLowerCase()
      );
      if (!exists) {
        categories.add(res.skillName);
      }
    });
    return Array.from(categories);
  }, [resources, allSupportedSkills]);

  const filteredNewRoleSkills = useMemo(() => {
    return allCurriculumCategories.filter(skill =>
      skill.toLowerCase().includes(newRoleSkillSearch.toLowerCase())
    );
  }, [allCurriculumCategories, newRoleSkillSearch]);

  const filteredEditRoleSkills = useMemo(() => {
    return allCurriculumCategories.filter(skill =>
      skill.toLowerCase().includes(editRoleSkillSearch.toLowerCase())
    );
  }, [allCurriculumCategories, editRoleSkillSearch]);

  const avgReadiness = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.readiness || 0), 0);
    return Math.round(sum / candidates.length);
  }, [candidates]);

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
        setNewRoleSkillSearch("");
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

  const handleEditRoleStart = (role) => {
    setEditingRoleId(role.id);
    setEditingRoleTitle(role.title);
    setEditingRoleDesc(role.description);
    setEditingRoleSkills(role.requiredSkills);
  };

  const handleSkillToggleInEditingRole = (skill) => {
    if (editingRoleSkills.includes(skill)) {
      setEditingRoleSkills(editingRoleSkills.filter(s => s !== skill));
    } else {
      setEditingRoleSkills([...editingRoleSkills, skill]);
    }
    setEditRoleSkillSearch("");
  };

  const handleEditRoleSave = async (id) => {
    if (!editingRoleTitle.trim()) return;
    const token = localStorage.getItem("np-mock-user-token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingRoleTitle,
          description: editingRoleDesc,
          requiredSkills: editingRoleSkills
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoles(roles.map(r => r.id === id ? data.data : r));
        setEditingRoleId(null);
        setEditingRoleTitle("");
        setEditingRoleDesc("");
        setEditingRoleSkills([]);
        setEditRoleSkillSearch("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRoleCancel = () => {
    setEditingRoleId(null);
    setEditingRoleTitle("");
    setEditingRoleDesc("");
    setEditingRoleSkills([]);
    setEditRoleSkillSearch("");
  };

  const handleSkillToggleInNewRole = (skill) => {
    if (newRoleSkills.includes(skill)) {
      setNewRoleSkills(newRoleSkills.filter(s => s !== skill));
    } else {
      setNewRoleSkills([...newRoleSkills, skill]);
    }
    setNewRoleSkillSearch("");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-black tracking-tight mb-2" style={{ color: t.textH }}>Active Competency Benchmarks</h2>
          
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border p-6 shadow-sm relative group" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              {editingRoleId === role.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Role Title</label>
                    <input
                      type="text"
                      value={editingRoleTitle}
                      onChange={(e) => setEditingRoleTitle(e.target.value)}
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
                      value={editingRoleDesc}
                      onChange={(e) => setEditingRoleDesc(e.target.value)}
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
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={editRoleSkillSearch}
                        onChange={(e) => setEditRoleSkillSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border outline-none"
                        style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2.5 space-y-1.5" style={{ borderColor: t.border }}>
                      {filteredEditRoleSkills.map((skill) => {
                        const isChecked = editingRoleSkills.includes(skill);
                        return (
                          <label key={skill} className="flex items-center gap-2.5 text-xs font-bold text-stone-850 dark:text-stone-150 hover:text-stone-950 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSkillToggleInEditingRole(skill)}
                              className="rounded outline-none border cursor-pointer w-3.5 h-3.5"
                              style={{ accentColor: t.outlineStroke }}
                            />
                            <span>{skill}</span>
                          </label>
                        );
                      })}
                      {filteredEditRoleSkills.length === 0 && (
                        <div className="text-[11px] text-stone-400 italic text-center py-2">
                          No skills match your search.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditRoleSave(role.id)}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-mono text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditRoleCancel}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 font-mono text-[10px] font-bold transition-all cursor-pointer border"
                      style={{ borderColor: t.border }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5">
                    <button
                      onClick={() => handleEditRoleStart(role)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border cursor-pointer transition-colors"
                      title="Edit Profile"
                      style={{ borderColor: t.border }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border cursor-pointer transition-colors"
                      title="Delete Profile"
                      style={{ borderColor: t.border }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold uppercase tracking-wide pr-14" style={{ color: t.textH }}>{role.title}</h3>
                  <p className="text-xs font-semibold mt-1.5 leading-relaxed" style={{ color: t.textMuted }}>{role.description || "No description provided."}</p>
                  
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: t.divider }}>
                    <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>Mapped Competency Benchmarks</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(!role.requiredSkills || role.requiredSkills.length === 0) ? (
                        <span className="text-xs text-stone-400 italic">No skills mapped to this profile.</span>
                      ) : (
                        role.requiredSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-[9px] font-black uppercase border" style={{ backgroundColor: t.tagBg, color: t.tagText, borderColor: t.tagBorder }}>
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
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
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={newRoleSkillSearch}
                  onChange={(e) => setNewRoleSkillSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-lg border outline-none"
                  style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                />
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2.5 space-y-1.5" style={{ borderColor: t.border }}>
                {filteredNewRoleSkills.map((skill) => {
                  const isChecked = newRoleSkills.includes(skill);
                  return (
                    <label key={skill} className="flex items-center gap-2.5 text-xs font-bold text-stone-850 dark:text-stone-150 hover:text-stone-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSkillToggleInNewRole(skill)}
                        className="rounded outline-none border cursor-pointer w-3.5 h-3.5"
                        style={{ accentColor: t.outlineStroke }}
                      />
                      <span>{skill}</span>
                    </label>
                  );
                })}
                {filteredNewRoleSkills.length === 0 && (
                  <div className="text-[11px] text-stone-400 italic text-center py-2">
                    No skills match your search.
                  </div>
                )}
              </div>
            </div>

            <button
              id="submit-role-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Save Competency Model</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
