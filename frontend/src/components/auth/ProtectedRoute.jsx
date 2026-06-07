import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";

export default function ProtectedRoute({ children, allowedRole }) {
    const { isLoggedIn, authLoading, profile } = useApp();
    const { t } = useTheme();

    if (authLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: t.bg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        border: `3px solid ${t.border}`,
                        borderTopColor: "#8b5cf6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <span style={{ fontSize: "14px", color: t.textMuted, fontWeight: 500 }}>
                    Authenticating secure gate...
                </span>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && profile) {
        if (profile.role !== allowedRole) {
            return <Navigate to={profile.role === "admin" ? "/admin" : "/upload"} replace />;
        }
    }

    return <>{children}</>;
}
