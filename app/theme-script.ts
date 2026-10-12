export type Theme = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before first paint so a forced theme never flashes the
// system one. "system" is the absence of the attribute; CSS falls back to
// prefers-color-scheme.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
