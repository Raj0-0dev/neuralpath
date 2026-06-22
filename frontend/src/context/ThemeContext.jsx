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
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const isDark = false;

    const toggle = () => {
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", "light");
        document.body.style.background = "#FAF9F6";
        document.body.style.transition = "background 0.3s, color 0.3s";
        document.body.style.color = "#1c1917";
    }, []);

    const value = {
        isDark,
        toggle,
        t: themes.light,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
