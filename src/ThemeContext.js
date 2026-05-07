import React, { createContext, useState, useEffect } from "react";

// ── Available themes ──────────────────────────────────────────
export const THEMES = {
  earthGreen: {
    name: "🌿 Earth Green",
    bg:      "#f0f7f0",
    surface: "#ffffff",
    card:    "#ffffff",
    border:  "#c8e6c9",
    green:   "#2e7d32",
    gold:    "#f9a825",
    red:     "#c62828",
    blue:    "#1565c0",
    purple:  "#6a1b9a",
    text:    "#1b2e1b",
    muted:   "#5a7a5a",
    bg2:     "#e8f5e9",
  },
  darkForest: {
    name: "🌑 Dark Forest",
    bg:      "#0a0f0a",
    surface: "#111811",
    card:    "#162016",
    border:  "#1e2e1e",
    green:   "#22c55e",
    gold:    "#f59e0b",
    red:     "#ef4444",
    blue:    "#3b82f6",
    purple:  "#a855f7",
    text:    "#e8f5e8",
    muted:   "#6b8f6b",
    bg2:     "#0d160d",
  },
  savanna: {
    name: "🌅 Savanna Sunset",
    bg:      "#fdf6ec",
    surface: "#ffffff",
    card:    "#fffaf3",
    border:  "#f0d9b5",
    green:   "#c17f24",
    gold:    "#e8a030",
    red:     "#c0392b",
    blue:    "#2980b9",
    purple:  "#8e44ad",
    text:    "#2c1810",
    muted:   "#8b6a4a",
    bg2:     "#fef3e2",
  },
  skyBlue: {
    name: "🌊 Clear Sky",
    bg:      "#f0f6ff",
    surface: "#ffffff",
    card:    "#ffffff",
    border:  "#bfdbfe",
    green:   "#0369a1",
    gold:    "#d97706",
    red:     "#dc2626",
    blue:    "#2563eb",
    purple:  "#7c3aed",
    text:    "#0f172a",
    muted:   "#64748b",
    bg2:     "#e0f2fe",
  },
  midnightPurple: {
    name: "🌙 Midnight",
    bg:      "#0d0d1a",
    surface: "#12122a",
    card:    "#181830",
    border:  "#2a2a4a",
    green:   "#a78bfa",
    gold:    "#fbbf24",
    red:     "#f87171",
    blue:    "#60a5fa",
    purple:  "#c084fc",
    text:    "#e2e8f0",
    muted:   "#7c6fa0",
    bg2:     "#0a0a18",
  },
  warmRed: {
    name: "🌺 Warm Red",
    bg:      "#fff5f5",
    surface: "#ffffff",
    card:    "#ffffff",
    border:  "#fecaca",
    green:   "#dc2626",
    gold:    "#f59e0b",
    red:     "#991b1b",
    blue:    "#1d4ed8",
    purple:  "#7e22ce",
    text:    "#1c0a0a",
    muted:   "#9a5c5c",
    bg2:     "#fee2e2",
  },
};

export const ThemeContext = createContext({
  theme: THEMES.earthGreen,
  themeName: "earthGreen",
  setThemeName: () => {},
  isDark: false,
});

export function ThemeProvider({ children }) {
  const [themeName, setThemeNameState] = useState(
    () => localStorage.getItem("agrobot_theme") || "earthGreen"
  );

  const setThemeName = (name) => {
    setThemeNameState(name);
    localStorage.setItem("agrobot_theme", name);
  };

  const theme  = THEMES[themeName] || THEMES.earthGreen;
  const isDark = ["darkForest", "midnightPurple"].includes(themeName);

  // Apply bg to document body
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color      = theme.text;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}