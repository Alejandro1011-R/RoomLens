/**
 * Theme control. Three states are supported, exactly as the brand book
 * requires: OS light, OS dark, and an explicit choice that beats the OS.
 * The explicit choice is stored, and every change is broadcast so the
 * WebGL scenes can re-read their colours from the tokens.
 */
const STORAGE_KEY = 'roomlens-theme';
export const THEME_EVENT = 'roomlens:themechange';

const root = document.documentElement;

/** Read a CSS custom property off the root element. */
export function token(name: string): string {
  return getComputedStyle(root).getPropertyValue(name).trim() || '#888888';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isDark(): boolean {
  const explicit = root.getAttribute('data-theme');
  return explicit
    ? explicit === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function onThemeChange(callback: () => void): void {
  document.addEventListener(THEME_EVENT, callback);
}

export function initTheme(): void {
  const button = document.getElementById('theme');
  if (!button) return;

  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage can be unavailable — the toggle still works for this visit */
    }
    document.dispatchEvent(new CustomEvent(THEME_EVENT));
  });

  // An OS-level change only matters while no explicit choice is in force.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!root.getAttribute('data-theme')) {
      document.dispatchEvent(new CustomEvent(THEME_EVENT));
    }
  });
}
