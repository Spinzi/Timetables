import { THEMES, DEFAULT_CUSTOM_VARS } from './themes.js';
import {
  getThemeName,
  setThemeName,
  getCustomThemeVars,
  setCustomThemeVars,
} from '../storage/preferences.js';

const listeners = new Set();

function applyVars(vars) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
}

export function getActiveThemeName() {
  return getThemeName();
}

export function getCustomVars() {
  return { ...DEFAULT_CUSTOM_VARS, ...(getCustomThemeVars() || {}) };
}

export function applyTheme(name = getThemeName()) {
  const vars = name === 'custom' ? getCustomVars() : (THEMES[name] || THEMES.default).vars;
  applyVars(vars);
  document.documentElement.dataset.theme = name;
  setThemeName(name);
  listeners.forEach((fn) => fn(name));
}

export function updateCustomVars(partialVars) {
  const merged = { ...getCustomVars(), ...partialVars };
  setCustomThemeVars(merged);
  if (getThemeName() === 'custom') applyVars(merged);
  return merged;
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initTheme() {
  applyTheme(getThemeName());
}
