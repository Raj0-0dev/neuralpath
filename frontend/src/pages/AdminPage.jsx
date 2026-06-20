import React from "react";
import { useApp } from "../context/AppContext";

export default function AdminPage() {
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
