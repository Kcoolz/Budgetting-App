import { useEffect, useState } from "react";

const THEME_KEY = "cloud-budget-theme";

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function savedPreference() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return ["light", "dark"].includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

export function useTheme() {
  const [preference, setPreference] = useState(savedPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (event) => setSystemDark(event.matches);
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b1320" : "#123a63");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setPreference(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // The visual theme can still change for this session.
    }
  };

  return { theme, toggleTheme };
}
