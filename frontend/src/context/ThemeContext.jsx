import React, { createContext, useContext, useState, useEffect } from "react";

const themes = {
    light: {
        isDark: false,
        bg: "#FAF9F6",
        bgNav: "rgba(250,249,246,0.92)",
        bgCard: "#ffffff",
        bgCream: "#fcfbf9",
        bgInput: "#ffffff",
        bgStep: "#FAF9F6",
        bgStepHover: "#f5f4ef",
        bgStatStrip: "rgba(250,249,246,0.85)",
        textH: "#1c1917",
        textBody: "#44403c",
        textMuted: "#78716c",
        textFaint: "#a8a29e",
        border: "#e5e5e0",
        borderInput: "#d6d3d1",
        tagBg: "#fef3c7",
        tagBorder: "#fde68a",
        tagText: "#b45309",
        tabBg: "#f5f4ef",
        tabBorder: "#e5e5e0",
        tabActive: "#ffffff",
        tabActiveText: "#1c1917",
        tabInactiveText: "#78716c",
        btnGhostBorder: "#e5e5e0",
        btnGhostText: "#1c1917",
        divider: "#e5e5e0",
        linkText: "#d97706",
        roleBtn: "#ffffff",
        roleBtnBorder: "#e5e5e0",
        roleBtnText: "#78716c",
        roleBtnSel: "linear-gradient(135deg,#fef3c7,#fde68a)",
        roleBtnSelBorder: "#d97706",
        roleBtnSelText: "#b45309",
        chartAxis: "#78716c",
        chartGrid: "rgba(28,25,23,0.06)",
        statBorder: "#e5e5e0",
        outlineStroke: "#d97706",
        heroGrad: "linear-gradient(130deg,#1c1917 0%,#44403c 60%,#d97706 100%)",
        heroSub: "rgba(28,25,23,0.6)",
        statN: "linear-gradient(130deg,#1c1917,#44403c)",
        stepNum: "#d6d3d1",
        aiExplain: "rgba(28,25,23,0.6)",
        inputBg: "#ffffff",
        inputText: "#1c1917",
        inputPlaceholder: "#a8a29e",
        selectBg: "#ffffff",
        selectText: "#1c1917",
    },
    dark: {
        isDark: true,
        bg: "#121110",
        bgNav: "rgba(18,17,16,0.92)",
        bgCard: "#1c1917",
        bgCream: "#292524",
        bgInput: "#1c1917",
        bgStep: "#292524",
        bgStepHover: "#3e3a38",
        bgStatStrip: "rgba(28,25,23,0.85)",
        textH: "#FAF9F6",
        textBody: "#d6d3d1",
        textMuted: "#a8a29e",
        textFaint: "#78716c",
        border: "#44403c",
        borderInput: "#57534e",
        tagBg: "rgba(217,119,6,0.15)",
        tagBorder: "rgba(217,119,6,0.3)",
        tagText: "#fbbf24",
        tabBg: "#292524",
        tabBorder: "#44403c",
        tabActive: "#1c1917",
        tabActiveText: "#FAF9F6",
        tabInactiveText: "#a8a29e",
        btnGhostBorder: "#44403c",
        btnGhostText: "#FAF9F6",
        divider: "#44403c",
        linkText: "#fbbf24",
        roleBtn: "#1c1917",
        roleBtnBorder: "#44403c",
        roleBtnText: "#a8a29e",
        roleBtnSel: "rgba(217,119,6,0.2)",
        roleBtnSelBorder: "#fbbf24",
        roleBtnSelText: "#fcd34d",
        chartAxis: "#a8a29e",
        chartGrid: "rgba(250,249,246,0.06)",
        statBorder: "#44403c",
        outlineStroke: "#fbbf24",
        heroGrad: "linear-gradient(130deg,#FAF9F6 0%,#d6d3d1 60%,#fbbf24 100%)",
        heroSub: "rgba(250,249,246,0.6)",
        statN: "linear-gradient(130deg,#FAF9F6,#d6d3d1)",
        stepNum: "#57534e",
        aiExplain: "rgba(250,249,246,0.6)",
        inputBg: "#1c1917",
        inputText: "#FAF9F6",
        inputPlaceholder: "#78716c",
        selectBg: "#1c1917",
        selectText: "#FAF9F6",
    },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("np-theme") === "dark";
    });

    const toggle = () => {
        setIsDark((d) => {
            const next = !d;
            localStorage.setItem("np-theme", next ? "dark" : "light");
            return next;
        });
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
        document.body.style.background = isDark ? "#121110" : "#FAF9F6";
        document.body.style.transition = "background 0.3s, color 0.3s";
        document.body.style.color = isDark ? "#FAF9F6" : "#1c1917";
    }, [isDark]);

    const value = {
        isDark,
        toggle,
        t: isDark ? themes.dark : themes.light,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
