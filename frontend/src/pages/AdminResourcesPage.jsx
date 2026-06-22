import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function AdminResourcesPage() {
  const { user } = useApp();
  const { t } = useTheme();

  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newResourceSkill, setNewResourceSkill] = useState("");
  const [newResourceVideos, setNewResourceVideos] = useState([{ title: "", url: "" }]);
  const [expandedSkills, setExpandedSkills] = useState([]);
  const [inlineInputs, setInlineInputs] = useState({});

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

  const avgReadiness = useMemo(() => {
    if (candidates.length === 0) return 0;
    const sum = candidates.reduce((acc, c) => acc + (c.readiness || 0), 0);
    return Math.round(sum / candidates.length);
  }, [candidates]);

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

  const handleToggleSkill = (skill) => {
    if (expandedSkills.includes(skill)) {
      setExpandedSkills(expandedSkills.filter(s => s !== skill));
    } else {
      setExpandedSkills([...expandedSkills, skill]);
    }
  };

  const handleInlineAddResource = async (e, skillName) => {
    e.preventDefault();
    const title = inlineInputs[skillName]?.title || "";
    const url = inlineInputs[skillName]?.url || "";
    if (!title.trim()) return;
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
          skillName,
          title,
          url,
          videoUrl: url,
          type: "video"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResources([...resources, data.data]);
        setInlineInputs({
          ...inlineInputs,
          [skillName]: { title: "", url: "" }
        });
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

  const handleAddVideoRow = () => {
    setNewResourceVideos([...newResourceVideos, { title: "", url: "" }]);
  };

  const handleRemoveVideoRow = (index) => {
    setNewResourceVideos(newResourceVideos.filter((_, idx) => idx !== index));
  };

  const handleVideoFieldChange = (index, field, value) => {
    const updated = [...newResourceVideos];
    updated[index] = { ...updated[index], [field]: value };
    setNewResourceVideos(updated);
  };

  const handleAddStudyMaterial = async (e) => {
    e.preventDefault();
    if (!newResourceSkill.trim()) return;
    const validVideos = newResourceVideos.filter(v => v.title.trim() && v.url.trim());
    if (validVideos.length === 0) return;
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
          skillName: newResourceSkill,
          videos: validVideos
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const addedData = Array.isArray(data.data) ? data.data : [data.data];
        setResources([...resources, ...addedData]);
        setNewResourceSkill("");
        setNewResourceVideos([{ title: "", url: "" }]);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-base font-black tracking-tight" style={{ color: t.textH }}>Active Study Material</h2>
            <p className="text-[11px] font-semibold mt-0.5 text-stone-400">Content mapped automatically to candidate competency gaps</p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {allCurriculumCategories.map((skillName) => {
              const isExpanded = expandedSkills.includes(skillName);
              const skillVideos = resources.filter(
                (res) => res.skillName.toLowerCase() === skillName.toLowerCase()
              );

              return (
                <div 
                  key={skillName} 
                  className="rounded-2xl border transition-all overflow-hidden" 
                  style={{ backgroundColor: t.bgCard, borderColor: t.border }}
                >
                  <button
                    onClick={() => handleToggleSkill(skillName)}
                    className="w-full px-5 py-4 flex items-center justify-between font-bold text-xs cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-850/10 transition-colors border-none outline-none"
                    style={{ color: t.textH }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase border"
                        style={{ 
                          backgroundColor: t.tagBg, 
                          color: t.tagText, 
                          borderColor: t.tagBorder 
                        }}
                      >
                        {skillName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({skillVideos.length} {skillVideos.length === 1 ? "Video" : "Videos"})
                      </span>
                    </div>
                    <span className="text-stone-400">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t p-5 space-y-4" style={{ borderColor: t.border }}>
                      {skillVideos.length === 0 ? (
                        <p className="text-xs text-stone-400 italic">No study material bound to this skill.</p>
                      ) : (
                        <div className="space-y-3">
                          {skillVideos.map((res) => (
                            <div 
                              key={res.id} 
                              className="flex justify-between items-center p-3 rounded-xl border relative group bg-stone-50/30 dark:bg-stone-850/10" 
                              style={{ borderColor: t.border }}
                            >
                              <div>
                                <h4 className="text-xs font-black" style={{ color: t.textH }}>{res.title}</h4>
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] font-semibold flex items-center gap-1 mt-1 hover:underline"
                                  style={{ color: t.linkText }}
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
                      )}

                      <form 
                        onSubmit={(e) => handleInlineAddResource(e, skillName)} 
                        className="pt-4 border-t space-y-3"
                        style={{ borderColor: t.border }}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.textMuted }}>
                          Add New Video to {skillName}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Video Title..."
                            value={inlineInputs[skillName]?.title || ""}
                            onChange={(e) => setInlineInputs({
                              ...inlineInputs,
                              [skillName]: {
                                ...(inlineInputs[skillName] || {}),
                                title: e.target.value
                              }
                            })}
                            required
                            className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                            style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                          />
                          <input
                            type="url"
                            placeholder="Video URL..."
                            value={inlineInputs[skillName]?.url || ""}
                            onChange={(e) => setInlineInputs({
                              ...inlineInputs,
                              [skillName]: {
                                ...(inlineInputs[skillName] || {}),
                                url: e.target.value
                              }
                            })}
                            required
                            className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                            style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-mono text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Plus size={12} />
                          <span>Add Video</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border p-6 h-fit" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
          <h2 className="text-base font-black tracking-tight mb-1" style={{ color: t.textH }}>Create Study Material</h2>
          <p className="text-[11px] font-semibold mb-6 text-stone-400">Add a new curriculum topic and its training videos</p>
          
          <form onSubmit={handleAddStudyMaterial} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: t.textMuted }}>Study Material / Skill Name</label>
              <input
                type="text"
                list="supported-skills-list"
                placeholder="e.g. Node.js or a custom topic"
                value={newResourceSkill}
                onChange={(e) => setNewResourceSkill(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
              />
              <datalist id="supported-skills-list">
                {allCurriculumCategories.map(skill => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>
            </div>

            <div className="space-y-3.5">
              <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: t.textMuted }}>Videos</label>
              
              {newResourceVideos.map((video, idx) => (
                <div key={idx} className="p-3 border rounded-xl space-y-2 relative" style={{ borderColor: t.border }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase font-mono text-stone-400">Video #{idx + 1}</span>
                    {newResourceVideos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVideoRow(idx)}
                        className="text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded-lg border-none cursor-pointer transition-colors"
                        title="Remove Video Row"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Video Title..."
                    value={video.title}
                    onChange={(e) => handleVideoFieldChange(idx, "title", e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                    style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                  />
                  
                  <input
                    type="url"
                    placeholder="Video URL..."
                    value={video.url}
                    onChange={(e) => handleVideoFieldChange(idx, "url", e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none"
                    style={{ backgroundColor: t.bgInput, borderColor: t.borderInput, color: t.inputText }}
                  />
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddVideoRow}
                className="w-full py-2 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[10px] font-bold rounded-lg border border-dashed flex items-center justify-center gap transition-all cursor-pointer"
                style={{ borderColor: t.border }}
              >
                <Plus size={11} />
                <span>Add Another Video Row</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Save Study Material</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
