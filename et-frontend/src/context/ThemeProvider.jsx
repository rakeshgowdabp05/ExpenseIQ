import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ThemeContext } from "./theme-context";

const LEGACY_THEME_STORAGE_KEY =
  "expense_tracker_theme";

const THEME_PREFERENCE_STORAGE_KEY =
  "expenseiq_theme_preference";

const VALID_THEME_PREFERENCES =
  new Set([
    "SYSTEM",
    "LIGHT",
    "DARK",
  ]);

function getSystemTheme() {
  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function normalizeThemePreference(
  value,
) {
  const normalizedValue = String(
    value ?? "",
  )
    .trim()
    .toUpperCase();

  return VALID_THEME_PREFERENCES.has(
    normalizedValue,
  )
    ? normalizedValue
    : "SYSTEM";
}

function getInitialThemePreference() {
  const storedPreference =
    localStorage.getItem(
      THEME_PREFERENCE_STORAGE_KEY,
    );

  if (storedPreference) {
    return normalizeThemePreference(
      storedPreference,
    );
  }

  const legacyTheme =
    localStorage.getItem(
      LEGACY_THEME_STORAGE_KEY,
    );

  if (legacyTheme === "light") {
    return "LIGHT";
  }

  if (legacyTheme === "dark") {
    return "DARK";
  }

  return "SYSTEM";
}

export function ThemeProvider({
  children,
}) {
  const [
    themePreference,
    setThemePreferenceState,
  ] = useState(
    getInitialThemePreference,
  );

  const [
    systemTheme,
    setSystemTheme,
  ] = useState(
    getSystemTheme,
  );

  const theme =
    themePreference === "SYSTEM"
      ? systemTheme
      : themePreference.toLowerCase();

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function handleSystemThemeChange(
      event,
    ) {
      setSystemTheme(
        event.matches
          ? "dark"
          : "light",
      );
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, []);

  useEffect(() => {
    document.documentElement
      .classList
      .toggle(
        "dark",
        theme === "dark",
      );

    document.documentElement.style
      .colorScheme = theme;

    localStorage.setItem(
      THEME_PREFERENCE_STORAGE_KEY,
      themePreference,
    );

    localStorage.setItem(
      LEGACY_THEME_STORAGE_KEY,
      theme,
    );
  }, [
    theme,
    themePreference,
  ]);

  const setThemePreference =
    useCallback(
      (newPreference) => {
        setThemePreferenceState(
          normalizeThemePreference(
            newPreference,
          ),
        );
      },
      [],
    );

  const toggleTheme =
    useCallback(() => {
      setThemePreferenceState(
        theme === "dark"
          ? "LIGHT"
          : "DARK",
      );
    }, [theme]);

  const contextValue =
    useMemo(
      () => ({
        theme,
        themePreference,
        setThemePreference,
        toggleTheme,
      }),
      [
        theme,
        themePreference,
        setThemePreference,
        toggleTheme,
      ],
    );

  return (
    <ThemeContext.Provider
      value={contextValue}
    >
      {children}
    </ThemeContext.Provider>
  );
}