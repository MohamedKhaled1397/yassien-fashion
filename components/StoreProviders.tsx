"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Lang } from "@/lib/strings";

type Theme = "light" | "dark";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

const LANG_KEY = "yassin_lang";
const THEME_KEY = "yassin_theme";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY) as Lang | null;
      if (l === "ar" || l === "en") setLangState(l);
      const t = localStorage.getItem(THEME_KEY) as Theme | null;
      if (t === "dark" || t === "light") setThemeState(t);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, ready]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((x) => (x === "light" ? "dark" : "light")),
    [],
  );

  const value = useMemo(
    () => ({ lang, setLang, theme, setTheme, toggleTheme }),
    [lang, setLang, theme, setTheme, toggleTheme],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useStore must be inside StoreProviders");
  return v;
}
