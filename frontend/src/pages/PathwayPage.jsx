import React from "react";
import { useApp } from "../context/AppContext";
import { 
  CheckCircle2, 
  BookOpen, 
  Map, 
  Layers, 
  ChevronRight, 
  Award, 
  Clock 
} from "lucide-react";
import { motion } from "motion/react";

export default function PathwayPage() {
  const { pathway, completedModules, toggleModuleCompleted } = useApp();

  const totalModulesCount = pathway?.phases?.reduce((acc, p) => acc + p.modules.length, 0) || 0;
  const completedCount = completedModules ? completedModules.size : 0;
  const percent = totalModulesCount > 0 ? Math.round((completedCount / totalModulesCount) * 100) : 0;

  const handleToggleModule = async (moduleId, skillName) => {
    if (toggleModuleCompleted) {
      await toggleModuleCompleted(moduleId, skillName);
    }
  };

  if (!pathway || !pathway.phases || pathway.phases.length === 0) {
    return (
      <div className="pt-12 md:pt-24 pb-16 px-4 md:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-5">
        <Map size={48} className="text-stone-400 animate-pulse" />
        <p className="font-sans text-stone-600 font-semibold text-base">
          No learning roadmap generated yet. Please upload your resume on the start assessment tab to map your pathway.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Learning Pathway</h1>
          <p className="text-stone-500 text-sm font-semibold mt-1">
            Topological competency roadmap targeting: <span className="text-amber-700 font-bold">{pathway.targetRole}</span>
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white rounded-[32px] border border-stone-200 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row justify-between items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <Award size={22} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Overall Pathway Completion</h3>
            <p className="text-stone-400 text-xs font-semibold">Completed {completedCount} of {totalModulesCount} total learning modules</p>
          </div>
        </div>
        
        <div className="w-full sm:w-64 flex flex-col items-end gap-1.5">
          <span className="font-mono text-xs font-bold text-stone-950">{percent}%</span>
          <div className="w-full h-2.5 bg-stone-150 rounded-full overflow-hidden border border-stone-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-stone-900 rounded-full" 
            />
          </div>
        </div>
      </motion.div>

      {/* Learning Phases Timeline */}
      <div className="space-y-8 relative">
        {pathway.phases.map((phase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            {/* Phase Badge Header */}
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-3">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0" 
                style={{ backgroundColor: phase.color }} 
              />
              <span>{phase.title}</span>
            </h2>

            {/* Modules Grid */}
            <div className="grid gap-5 md:grid-cols-2">
              {phase.modules?.map((mod) => {
                const isCompleted = completedModules ? completedModules.has(mod.id) : false;

                return (
                  <div 
                    key={mod.id} 
                    className={`border rounded-2xl p-5 bg-white transition-all flex flex-col justify-between group ${
                      isCompleted 
                        ? "border-emerald-600/30 shadow-[0_4px_20px_rgba(5,150,105,0.02)]" 
                        : "border-stone-200 hover:border-stone-400 shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Tags & Metadata Header */}
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md border uppercase ${
                          mod.type === "Lab" 
                            ? "bg-stone-100 border-stone-200 text-stone-600" 
                            : "bg-amber-50 border-amber-200/50 text-amber-900"
                        }`}>
                          {mod.type}
                        </span>
                        
                        <div className="flex items-center gap-3 text-stone-400 font-mono text-[10px] font-semibold">
                          <span className="flex items-center gap-1"><Clock size={11} /> {mod.duration}</span>
                          <span className="uppercase">{mod.level}</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className={`font-bold text-sm tracking-tight mb-1 transition-colors ${
                        isCompleted ? "text-stone-400 line-through" : "text-stone-855"
                      }`}>
                        {mod.title}
                      </h3>
                      <p className={`text-xs font-semibold leading-relaxed mb-4 ${
                        isCompleted ? "text-stone-300" : "text-stone-500"
                      }`}>
                        {mod.description}
                      </p>
                    </div>

                    {/* Checkbox Trigger Footer */}
                    <div className="border-t border-stone-100 pt-3.5 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">{mod.skillName}</span>
                      
                      <button
                        onClick={() => handleToggleModule(mod.id, mod.skillName)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-700" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <span>Mark Complete</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
