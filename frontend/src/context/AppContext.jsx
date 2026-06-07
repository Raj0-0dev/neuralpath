import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");

    const [analysis, setAnalysisState] = useState({
        candidateName: "Harsh Rajput",
        targetRole: "Lead Software Engineer",
        overallReadiness: 72,
        timeToReadiness: "4-8 weeks"
    });

    const [pathway, setPathwayState] = useState({
        candidateName: "Harsh Rajput",
        targetRole: "Lead Software Engineer",
        phases: [
            {
                title: "Phase 1: Advanced Frontend Dev",
                color: "#8b5cf6",
                modules: [
                    {
                        id: "react_arch",
                        title: "Modern React Architecture",
                        type: "Course",
                        duration: "2.5 HRS",
                        level: "Intermediate",
                        description: "Examine state reconciliators, Fiber nodes, high-frequency render optimization, and render lifecycles."
                    },
                    {
                        id: "typescript_perf",
                        title: "TypeScript Performance",
                        type: "Lab",
                        duration: "1.8 HRS",
                        level: "Advanced",
                        description: "Benchmark complex type-mapping, conditional generic utility structures, ast parsing filters, and compiler speed configurations."
                    }
                ]
            }
        ]
    });

    const [completedModules, setCompletedModules] = useState(new Set(["react_arch"]));
    const [activityLog, setActivityLog] = useState([]);
    const [dailyHours, setDailyHours] = useState({});

    // Hydrate user and progress on mount
    useEffect(() => {
        const hydrate = () => {
            try {
                const storedUser = localStorage.getItem("np-mock-user");
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    setProfile(parsed);
                }
            } catch (err) {
                console.error("Hydration expired:", err);
            } finally {
                setAuthLoading(false);
            }
        };
        hydrate();
    }, []);

    const refreshProgress = async () => {
        // Client-side stub
        return Promise.resolve();
    };

    const loginUser = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password) {
                    reject(new Error("Email and password are required."));
                    return;
                }

                // Mock success login
                const role = email.includes("admin") ? "admin" : "employee";
                const mockUser = {
                    uid: "mock-uid-" + Date.now(),
                    email: email,
                    name: email.split("@")[0].toUpperCase(),
                    role: role
                };

                localStorage.setItem("np-mock-user", JSON.stringify(mockUser));
                setUser(mockUser);
                setProfile(mockUser);
                resolve({ user: mockUser, token: "mock-token-xyz" });
            }, 800);
        });
    };

    const signupUser = async (email, password, extra = {}) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password || !extra.name) {
                    reject(new Error("Missing required registration fields."));
                    return;
                }

                // Mock success signup
                const mockUser = {
                    uid: "mock-uid-" + Date.now(),
                    email: email,
                    name: extra.name,
                    role: extra.role || "employee",
                    targetRole: extra.targetRole || "",
                    company: extra.company || ""
                };

                localStorage.setItem("np-mock-user", JSON.stringify(mockUser));
                setUser(mockUser);
                setProfile(mockUser);
                resolve({ user: mockUser, token: "mock-token-xyz" });
            }, 800);
        });
    };

    const signinGoogle = async (extra = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = {
                    uid: "mock-google-uid-" + Date.now(),
                    email: "google.user@example.com",
                    name: "Google Candidate",
                    role: extra.role || "employee",
                    targetRole: extra.targetRole || "",
                    company: extra.company || ""
                };

                localStorage.setItem("np-mock-user", JSON.stringify(mockUser));
                setUser(mockUser);
                setProfile(mockUser);
                resolve({ user: mockUser, token: "mock-token-xyz" });
            }, 800);
        });
    };

    const handleLogOut = async () => {
        localStorage.removeItem("np-mock-user");
        setUser(null);
        setProfile(null);
        setResumeText("");
        setJdText("");
        setCompletedModules(new Set());
        setActivityLog([]);
        setDailyHours({});
    };

    const isLoggedIn = !!user;

    const value = {
        user,
        profile,
        authLoading,
        resumeText,
        setResumeText,
        jdText,
        setJdText,
        analysis,
        setAnalysis: setAnalysisState,
        pathway,
        setPathway: setPathwayState,
        adaptPathwayOnServer: () => Promise.resolve(null),
        completedModules,
        toggleModuleCompleted: () => Promise.resolve(),
        activityLog,
        setActivityLog,
        dailyHours,
        setDailyHours,
        handleLogOut,
        isLoggedIn,
        refreshProgress,
        signInEmail: loginUser,
        signUpEmail: signupUser,
        signInGoogle: signinGoogle
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};
