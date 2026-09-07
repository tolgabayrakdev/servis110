import { createContext, useContext, useLayoutEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "servis110-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
      root.style.backgroundColor =
        resolvedTheme === "dark" ? "#191919" : "#fafafa";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", root.style.backgroundColor);
    };

    applyTheme();
    if (theme === "system") media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        /* Storage may be unavailable in private browsing. */
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- tema hook'u sağlayıcıyla aynı bağlamı paylaşır
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
