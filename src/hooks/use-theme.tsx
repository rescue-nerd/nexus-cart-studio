"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = "default" | "ruby" | "forest" | "amethyst" | "sapphire" | "sunset" | "jade";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "default",
  storageKey = "store-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    setTheme(storedTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("theme-forest", "theme-ruby", "theme-amethyst", "theme-sapphire", "theme-sunset", "theme-jade");
    
    if (theme !== "default") {
      root.classList.add(`theme-${theme}`);
    }

    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
