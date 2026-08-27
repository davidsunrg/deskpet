import * as React from 'react';
import { ScriptOnce } from '@tanstack/react-router';
import { websiteConfig } from '@/config/website';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme?: 'light' | 'dark';
};

const themeSwitchEnabled = websiteConfig.ui?.mode?.enableSwitch !== false;
const configuredDefault: 'light' | 'dark' =
  websiteConfig.ui?.mode?.defaultMode === 'dark' ? 'dark' : 'light';

const initialState: ThemeProviderState = {
  theme: themeSwitchEnabled ? 'system' : configuredDefault,
  setTheme: () => null,
  resolvedTheme: configuredDefault,
  systemTheme: undefined,
};

const ThemeProviderContext =
  React.createContext<ThemeProviderState>(initialState);

const themeScript = themeSwitchEnabled
  ? `(function() {
  try {
    var theme = localStorage.getItem('theme') || '${configuredDefault}';
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var resolved = theme === 'system' ? systemTheme : theme;
    document.documentElement.classList.add(resolved);
  } catch (e) {
    document.documentElement.classList.add('${configuredDefault}');
  }
})();`
  : `(function() {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add('${configuredDefault}');
})();`;

/**
 * Single theme provider: SSR-safe, prevents FOUC via inline script, configurable.
 * When `websiteConfig.ui.mode.enableSwitch` is false, the theme is locked to
 * `defaultMode` (DeskPet uses light-only).
 */
export function ThemeProvider({
  children,
  defaultTheme = themeSwitchEnabled
    ? (websiteConfig.ui?.mode?.defaultMode ?? 'system')
    : configuredDefault,
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = themeSwitchEnabled,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (!themeSwitchEnabled) {
      return configuredDefault;
    }

    if (typeof window === 'undefined') {
      return defaultTheme;
    }

    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      return stored || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = React.useState<
    'light' | 'dark' | undefined
  >(() => {
    if (!themeSwitchEnabled || typeof window === 'undefined') {
      return undefined;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [isMounted, setIsMounted] = React.useState(false);

  const resolvedTheme = themeSwitchEnabled
    ? theme === 'system'
      ? systemTheme
      : theme
    : configuredDefault;

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      if (!themeSwitchEnabled) {
        return;
      }

      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Ignore localStorage errors
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const applyTheme = React.useCallback(
    (targetTheme: 'light' | 'dark' | undefined) => {
      if (!targetTheme || typeof document === 'undefined') return;

      const root = document.documentElement;

      if (disableTransitionOnChange) {
        const css = document.createElement('style');
        css.appendChild(
          document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
          )
        );
        document.head.appendChild(css);

        (() => window.getComputedStyle(document.body))();

        setTimeout(() => {
          document.head.removeChild(css);
        }, 1);
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(targetTheme);
      } else {
        root.setAttribute(attribute, targetTheme);
      }
    },
    [attribute, disableTransitionOnChange]
  );

  React.useEffect(() => {
    if (isMounted) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme, applyTheme, isMounted]);

  React.useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [enableSystem]);

  React.useEffect(() => {
    setIsMounted(true);

    if (!themeSwitchEnabled) {
      applyTheme(configuredDefault);
      return;
    }

    let hydratedTheme = theme;
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme) {
        hydratedTheme = storedTheme;
        if (storedTheme !== theme) setThemeState(storedTheme);
      }
    } catch {
      // Ignore localStorage errors and keep the configured default theme.
    }

    const currentTheme =
      hydratedTheme === 'system' ? systemTheme : hydratedTheme;
    applyTheme(currentTheme);
  }, [theme, systemTheme, storageKey, applyTheme]);

  const value = React.useMemo(
    () => ({
      theme: themeSwitchEnabled ? theme : configuredDefault,
      setTheme,
      resolvedTheme:
        isMounted && resolvedTheme ? resolvedTheme : configuredDefault,
      systemTheme: isMounted ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, systemTheme, isMounted]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <ScriptOnce>{themeScript}</ScriptOnce>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export function useResolvedTheme() {
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    configuredDefault
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setResolvedTheme(root.classList.contains('dark') ? 'dark' : 'light');
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return resolvedTheme;
}
