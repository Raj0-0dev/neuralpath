import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider, useApp } from "./context/AppContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Menu } from "lucide-react";

// Common Components
import VisitorHeader from "./components/layout/VisitorHeader";
import AuthSidebar from "./components/layout/AuthSidebar";

// Page Views
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import PathwayPage from "./pages/PathwayPage";
import AdminTalentPage from "./pages/AdminTalentPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";

function AppContent() {
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Authenticated workspace routes
  const authRoutes = ["/dashboard", "/upload", "/pathwaypage", "/admin"];
  const isAuthRoute = isLoggedIn && (
    authRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/admin")
  );

  return (
    <div className={`min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-100 selection:text-amber-900 flex flex-col ${location.pathname === "/login" ? "h-screen overflow-hidden" : ""}`}>
      {!isAuthRoute && <VisitorHeader />}

      {isAuthRoute && (
        <AuthSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      )}

      {isAuthRoute && isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed left-4 top-4 z-40 p-2 bg-[#FCFBF9] rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-stone-950 transition-all shadow-sm hidden md:flex cursor-pointer animate-fade-in"
          title="Expand Sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      <main className={`flex-1 flex flex-col transition-all duration-300 ${!isAuthRoute ? "pt-24" : "pt-16 md:pt-0"} ${isAuthRoute && !isSidebarCollapsed ? "md:pl-64" : "md:pl-0"}`}>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Candidate Protected Views */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute allowedRole="employee">
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pathwaypage"
            element={
              <ProtectedRoute allowedRole="employee">
                <PathwayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="employee">
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Gated Views */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/talent" replace />}
          />
          <Route
            path="/admin/talent"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTalentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminRolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent elegant footer on public routes */}
      {!isAuthRoute && location.pathname !== "/login" && (
        <footer className="py-12 border-t border-stone-200 bg-white text-center mt-auto">
          <p className="font-mono text-[10px] text-stone-400 font-semibold max-w-xl mx-auto px-4">
            &copy; {new Date().getFullYear()} NeuralPath. All rights reserved. Strategic Talent Alignments Gating & Topological Competencies Pipeline.
          </p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}
