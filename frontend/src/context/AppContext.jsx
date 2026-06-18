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

    // Hydrate user and session on mount
    useEffect(() => {
        const hydrate = async () => {
            const token = localStorage.getItem("np-mock-user-token");
            if (!token) {
                setAuthLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    const fetchedUser = {
                        uid: result.data._id,
                        email: result.data.email,
                        name: result.data.name,
                        role: result.data.role,
                        targetRole: result.data.targetRole || "",
                        company: result.data.company || "",
                    };
                    setUser(fetchedUser);
                    setProfile(fetchedUser);
                } else {
                    localStorage.removeItem("np-mock-user-token");
                    localStorage.removeItem("np-mock-user");
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error("Hydration expired/error:", err);
                const storedUser = localStorage.getItem("np-mock-user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } finally {
                setAuthLoading(false);
            }
        };
        hydrate();
    }, []);

    const refreshProgress = async () => {
        return Promise.resolve();
    };

    const loginUser = async (email, password) => {
        if (!email || !password) {
            throw new Error("Email and password are required.");
        }

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to log in.");
        }

        const loggedUser = {
            uid: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            targetRole: data.user.targetRole || "",
            company: data.user.company || "",
        };

        localStorage.setItem("np-mock-user-token", data.token);
        localStorage.setItem("np-mock-user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        setProfile(loggedUser);

        return { user: loggedUser, token: data.token };
    };

    const signupUser = async (email, password, extra = {}) => {
        if (!email || !password || !extra.name) {
            throw new Error("Missing required registration fields.");
        }

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                role: extra.role || "employee",
                name: extra.name,
                targetRole: extra.targetRole || "",
                company: extra.company || "",
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        // Auto-login the user after registration
        return loginUser(email, password);
    };

    const signinGoogle = async (extra = {}) => {
        throw new Error("Google Sign-In integration not implemented in the API yet.");
    };

    const handleLogOut = async () => {
        const token = localStorage.getItem("np-mock-user-token");
        if (token) {
            try {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
            } catch (err) {
                console.error("Logout request error:", err);
            }
        }
        localStorage.removeItem("np-mock-user-token");
        localStorage.removeItem("np-mock-user");
        setUser(null);
        setProfile(null);
        setResumeText("");
        setJdText("");
        setCompletedModules(new Set());
        setActivityLog([]);
        setDailyHours({});
    };

    const loadLearningPath = async () => {
        const token = localStorage.getItem("np-mock-user-token");
        if (!token) return;

        try {
            const res = await fetch("/api/learning-path", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const result = await res.json();
                const pathData = result.data.pathway;
                const progressData = result.data.progress;

                if (pathData) {
                    setPathwayState(pathData);
                }
                if (progressData) {
                    setCompletedModules(new Set(progressData.completedModules || []));
                }
            }
        } catch (err) {
            console.error("Failed to load learning path:", err);
        }
    };

    const loadGapAnalysis = async () => {
        const token = localStorage.getItem("np-mock-user-token");
        if (!token) return;

        try {
            const res = await fetch("/api/gap-analysis/my-profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const result = await res.json();
                const gapData = result.data;
                setAnalysisState({
                    candidateName: user?.name || "Candidate",
                    targetRole: gapData.targetRole,
                    overallReadiness: gapData.programmatic.matchPercentage,
                    timeToReadiness: gapData.programmatic.matchPercentage >= 75 ? "1-3 weeks" : "3-6 weeks",
                    extractedSkills: gapData.currentSkills,
                    gaps: gapData.programmatic.missingSkills
                });
            }
        } catch (err) {
            console.error("Failed to load gap analysis on state hydration:", err);
        }
    };

    useEffect(() => {
        if (user) {
            loadGapAnalysis();
            loadLearningPath();
        }
    }, [user]);

    const toggleModuleCompleted = async (moduleId, skillName) => {
        const token = localStorage.getItem("np-mock-user-token");
        if (!token) return;

        try {
            const res = await fetch("/api/learning-path/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ moduleId, skillName })
            });

            if (res.ok) {
                const result = await res.json();
                const progressData = result.data;
                setCompletedModules(new Set(progressData.completedModules || []));
                // Reload learning path to capture updated completion stats
                await loadLearningPath();
            }
        } catch (err) {
            console.error("Failed to complete module:", err);
        }
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
        toggleModuleCompleted,
        activityLog,
        setActivityLog,
        dailyHours,
        setDailyHours,
        handleLogOut,
        isLoggedIn,
        refreshProgress,
        loadGapAnalysis,
        loadLearningPath,
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
