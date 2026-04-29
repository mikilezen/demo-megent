"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type ThemePreference = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = "megent-theme";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hasWindow = typeof window !== "undefined";
  const initialStored = hasWindow ? window.localStorage.getItem(storageKey) : null;
  const isFirstVisit = hasWindow && initialStored === null;
  const isFirstVisitRef = useRef<boolean>(isFirstVisit);

  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (!hasWindow) return "system";
    if (initialStored === "light" || initialStored === "dark" || initialStored === "system") {
      return initialStored as ThemePreference;
    }
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (!hasWindow) return "light";
    const current = (initialStored === "light" || initialStored === "dark" || initialStored === "system")
      ? (initialStored as ThemePreference)
      : "system";
    return current === "system" ? (isFirstVisit ? "light" : getSystemTheme()) : current;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
      return preference === "system" ? (media.matches ? "dark" : "light") : preference;
    };

    const applyTheme = (preference: ThemePreference) => {
      const next = resolveTheme(preference);
      setResolvedTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    };

    // On first visit, keep initial appearance light even though preference is "system".
    if (isFirstVisitRef.current && theme === "system") {
      applyTheme("light");
    } else {
      applyTheme(theme);
    }

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, nextTheme);
    }
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
