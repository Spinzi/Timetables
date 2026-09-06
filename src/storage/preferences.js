// ---------------------------------------------------------------------------
// All localStorage access is funneled through this module so the rest of
// the app never touches `localStorage` directly and never persists
// timetable *data* — only user preferences.
// ---------------------------------------------------------------------------

const KEYS = {
  theme: 'timetables:theme',
  customTheme: 'timetables:customTheme',
  viewMode: 'timetables:viewMode',
  lastDay: 'timetables:lastDay:',
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, quota, etc.) — fail silently */
  }
}

export function getThemeName() {
  return safeGet(KEYS.theme) || 'default';
}

export function setThemeName(name) {
  safeSet(KEYS.theme, name);
}

export function getCustomThemeVars() {
  try {
    const raw = safeGet(KEYS.customTheme);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCustomThemeVars(vars) {
  safeSet(KEYS.customTheme, JSON.stringify(vars));
}

export function getViewMode() {
  return safeGet(KEYS.viewMode) === 'week' ? 'week' : 'day';
}

export function setViewMode(mode) {
  safeSet(KEYS.viewMode, mode === 'week' ? 'week' : 'day');
}

export function getLastDay(timetableName) {
  return safeGet(KEYS.lastDay + timetableName);
}

export function setLastDay(timetableName, dayName) {
  safeSet(KEYS.lastDay + timetableName, dayName);
}
