import React from "react";
import { useApp } from "./context/AppContext";

export function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-stone-850 mb-2">Upload Profile</h1>
      <p className="text-stone-450 mb-6">Submit your resume and target job description to dynamically adapt your learning pathway.</p>
      <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center bg-white shadow-sm hover:border-amber-400 transition-colors">
        <p className="text-stone-600 font-medium mb-1">Drag and drop your file here, or click to browse</p>
        <p className="text-stone-400 text-xs font-mono">Supports PDF, DOCX (Max 5MB)</p>
      </div>
    </div>
  );
}

export function PathwayPage() {
  const { pathway } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-stone-850 mb-2">Learning Pathway</h1>
      <p className="text-stone-450 mb-6 font-mono text-xs">Topological Competency Mapping Pipeline</p>
      
      <div className="space-y-6">
        {pathway?.phases?.map((phase, idx) => (
          <div key={idx} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-850 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
              {phase.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {phase.modules?.map((mod) => (
                <div key={mod.id} className="border border-stone-100 rounded-lg p-4 bg-stone-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-600 uppercase font-semibold">
                      {mod.type}
                    </span>
                    <span className="text-xs font-mono text-stone-400 font-medium">{mod.duration}</span>
                  </div>
                  <h3 className="font-bold text-stone-850 text-sm mb-1">{mod.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{mod.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, handleLogOut } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850">Welcome, {user?.name || "Candidate"}</h1>
          <p className="text-stone-450 text-sm mt-1">Role: <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs uppercase">{user?.role}</span></p>
        </div>
        <button 
          onClick={handleLogOut}
          className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-stone-400 text-xs font-mono font-bold uppercase mb-2">Overall Readiness</h3>
          <p className="text-4xl font-bold text-stone-850">72%</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-stone-400 text-xs font-mono font-bold uppercase mb-2">Time to Target</h3>
          <p className="text-4xl font-bold text-stone-850">4-8 wks</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-stone-400 text-xs font-mono font-bold uppercase mb-2">Completed Modules</h3>
          <p className="text-4xl font-bold text-stone-850">1 / 2</p>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const { user, handleLogOut } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850">Admin Control Panel</h1>
          <p className="text-stone-450 text-sm mt-1">Logged in as: <span className="font-mono bg-rose-100 text-rose-900 px-2 py-0.5 rounded text-xs uppercase">{user?.role}</span></p>
        </div>
        <button 
          onClick={handleLogOut}
          className="bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-850 mb-4">Competency Configurations</h2>
        <p className="text-sm text-stone-600">This view is restricted to administrators only. You can adjust module nodes and mapping configurations here.</p>
      </div>
    </div>
  );
}
