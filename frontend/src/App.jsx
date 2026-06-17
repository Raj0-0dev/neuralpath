import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider, useApp } from "./context/AppContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Common Components
import VisitorHeader from "./components/layout/VisitorHeader";

// Page Views
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import PathwayPage from "./pages/PathwayPage";
import { AdminPage } from "./StubPages";

function AppContent() {
  const location = useLocation();
  const { isLoggedIn } = useApp();

  // Authenticated workspace routes
  const authRoutes = ["/dashboard", "/upload", "/pathway", "/admin"];
  const isAuthRoute = isLoggedIn && authRoutes.includes(location.pathname);

  return (
    <div className={`min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-100 selection:text-amber-900 flex flex-col ${location.pathname === "/login" ? "h-screen overflow-hidden" : ""}`}>
      {!isAuthRoute && <VisitorHeader />}

      <main className={`flex-1 flex flex-col ${!isAuthRoute ? "pt-24" : ""}`}>
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
            path="/pathway"
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
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPage />
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
