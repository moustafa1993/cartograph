"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme-script";

const OPTIONS: Theme[] = ["system", "light", "dark"];
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

export function ThemeControl() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex overflow-hidden rounded border border-border"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => applyTheme(option)}
          className={`px-1.5 py-0.5 text-[11px] ${
            theme === option
              ? "bg-accent text-accent-fg"
              : "text-muted hover:text-fg"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
