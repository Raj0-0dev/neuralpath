import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PRESETS = [
  {
    title: "MLOps Engineer (Critical Systems)",
    description: "Deep competence in Machine Learning pipelines. Critical requirements include Kubernetes / Docker containers, Python pipelines, Distributed Systems, MLOps / Deployment pipelines, System Design, and Cloud Platforms (AWS).",
  },
  {
    title: "Senior Full Stack Architect (Agile)",
    description: "Architecting high-availability systems. Critical competencies in React / Frontend applications, Backend Development, Database / SQL storage systems, System Design, Communication, Agile / Scrum management, and Team Leadership.",
  },
  {
    title: "Enterprise Project Manager",
    description: "Strategic project delivery and technical coordination. Critical requirements in Project Management, Agile / Scrum sprints, Communication, Team Leadership, and System Design concepts.",
  },
];

export default function UploadPage() {
  const { profile, setAnalysis, setPathway, analysis, loadGapAnalysis, loadLearningPath } = useApp();
  const { isDark, t } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("np-mock-user-token");
      if (!token) return;
      try {
        const res = await fetch("/api/gap-analysis/roles", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.data.length > 0) {
          setAvailableRoles(data.data);
          setTargetRole(data.data[0].title);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoles();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileDetails({ name: file.name, size: file.size });
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload or drop a PDF resume file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("np-mock-user-token");

      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("targetRole", targetRole);

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.message || `Upload failed with status code ${res.status}`);
      }

      const result = await res.json();

      // Update global context states with the returned data
      setAnalysis({
        candidateName: profile?.name || "Candidate",
        targetRole: result.data.targetRole,
        overallReadiness: result.data.matchPercentage,
        timeToReadiness: result.data.matchPercentage >= 75 ? "1-3 weeks" : "3-6 weeks",
        extractedSkills: result.data.skills,
        gaps: []
      });

      // Fetch dynamic gap analysis from backend to hydrate missing skills
      try {
        const gapRes = await fetch("/api/gap-analysis/my-profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (gapRes.ok) {
          const gapData = await gapRes.json();
          setAnalysis({
            candidateName: profile?.name || "Candidate",
            targetRole: result.data.targetRole,
            overallReadiness: gapData.data.programmatic.matchPercentage,
            timeToReadiness: gapData.data.programmatic.matchPercentage >= 75 ? "1-3 weeks" : "3-6 weeks",
            extractedSkills: result.data.skills,
            gaps: gapData.data.programmatic.missingSkills
          });

          // Load the actual dynamic learning path (with videos) from the backend
          await loadLearningPath();
        }
      } catch (gapErr) {
        console.error("Failed to load gap details dynamically:", gapErr);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Critical error matching competencies to qualifications.");
    } finally {
      setLoading(false);
    }
  };

  const skillsList = analysis?.extractedSkills || [
    "React Enterprise", "TS Interfaces", "Node REST Engines", "PostgreSQL DB", "Docker Containers", "AWS S3/Lambda"
  ];

  const gapsList = analysis?.gaps || [
    "Advanced Microservice Orchestration & Istio Mesh",
    "Distributed Consensus Algorithms & Raft Model",
    "State Synchronizers (Redux / Zustand Scaled)",
    "Consolidated Testing Suites (Vitest & Mock APIs)"
  ];

  return (
    <div className="pt-6 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-12 bg-white px-6 py-4 rounded-full border border-stone-200/80 shadow-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${step > s ? "bg-stone-900 border-stone-900 text-white" :
              step === s ? "bg-stone-900 border-stone-900 text-white" :
                "bg-white border-stone-200 text-stone-400"
              }`}>
              {step > s ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-2 rounded-full ${step > s ? "bg-stone-900" : "bg-stone-200"
                }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-2">Upload Profile Credentials</h2>
              <p className="text-stone-500 text-sm font-semibold">Drop your updated resume to extract skills and identify onboarding gaps.</p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider ml-1">Select Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-850 text-xs font-semibold focus:outline-none focus:border-stone-900 transition-colors cursor-pointer appearance-none"
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map((role) => (
                    <option key={role.id} value={role.title}>{role.title}</option>
                  ))
                ) : (
                  <>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </>
                )}
              </select>
            </div>

            <div className="relative group">
              <div
                {...getRootProps()}
                className={`p-10 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer ${fileDetails ? 'bg-amber-50/20 border-amber-600/50' : 'bg-white border-stone-200 hover:border-stone-400 shadow-sm'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="text-stone-600" size={20} />
                </div>
                <div className="text-sm font-bold text-stone-800">
                  {fileDetails ? fileDetails.name : "Select or drop PDF resume file"}
                </div>
                <p className="text-stone-400 text-xs mt-1">Accepts PDF resumes up to 5MB</p>
              </div>
            </div>

            {error && (
              <div className="flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <AlertCircle className="shrink-0" size={16} />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="w-full py-4 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-100 disabled:text-stone-400 text-white font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Analysing your resume...</span>
                </>
              ) : (
                "Initialize Analysis"
              )}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: t.textH }}>Extracted Experience Map</h2>
              <p className="text-sm font-semibold" style={{ color: t.textMuted }}>
                Identified <span className="text-amber-600 font-bold">{skillsList.length} qualified skills</span> and defined gap priorities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {skillsList.slice(0, 6).map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2.5 p-4 rounded-xl border shadow-sm"
                  style={{ backgroundColor: t.bgCard, borderColor: t.border }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="font-bold text-xs" style={{ color: t.textBody }}>{skill}</span>
                </div>
              ))}
            </div>

            <div
              className="p-6 rounded-[32px] border"
              style={{
                backgroundColor: isDark ? "rgba(217,119,6,0.1)" : "rgba(254,243,199,0.2)",
                borderColor: isDark ? "rgba(217,119,6,0.3)" : "#fde68a"
              }}
            >
              <h3 className="flex items-center gap-2 font-extrabold text-sm mb-4" style={{ color: isDark ? t.textH : "#78350f" }}>
                <BrainCircuit size={18} />
                Critical Onboarding Gaps
              </h3>
              <ul className="space-y-3">
                {gapsList.slice(0, 4).map((gap) => (
                  <li key={gap} className="flex items-start gap-3 text-xs font-semibold leading-relaxed" style={{ color: t.textBody }}>
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                      style={{ backgroundColor: t.bgStep, borderColor: t.border, borderWidth: "1px", color: t.textBody }}
                    >
                      !
                    </span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-4 font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 text-sm active:scale-98 cursor-pointer border hover:opacity-90"
              style={{
                backgroundColor: isDark ? t.bgCard : "#1c1917",
                color: isDark ? t.textH : "#ffffff",
                borderColor: t.border,
                borderWidth: "1px"
              }}
            >
              <span>Generate Tailored Roadmap</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div
              className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto"
              style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "#ecfdf5", borderColor: isDark ? "rgba(16,185,129,0.3)" : "#a7f3d0" }}
            >
              <CheckCircle2 size={28} className={isDark ? "text-emerald-400" : "text-emerald-700"} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: t.textH }}>Roadmap Compiled</h2>
              <p className="text-sm font-semibold px-6" style={{ color: t.textMuted }}>Your adaptive career path has been structured relative to your goal milestones.</p>
            </div>

            <div className="p-6 rounded-[32px] border shadow-sm text-left" style={{ backgroundColor: t.bgCard, borderColor: t.border }}>
              <div className="flex justify-between text-[11px] font-bold mb-2 font-mono uppercase tracking-wider" style={{ color: t.textMuted }}>
                <span>PATH_ID: NP_6672</span>
                <span>INITIAL PROGRESS: 0%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden border" style={{ backgroundColor: t.bgStep, borderColor: t.border }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "15%" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: isDark ? t.textH : "#1c1917" }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate("/pathwaypage")}
              className="w-full py-4 font-bold rounded-full shadow-md transition-all text-sm cursor-pointer border hover:opacity-90"
              style={{
                backgroundColor: isDark ? t.bgCard : "#1c1917",
                color: isDark ? t.textH : "#ffffff",
                borderColor: t.border,
                borderWidth: "1px"
              }}
            >
              Enter Learning Path
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
