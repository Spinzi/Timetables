// ---------------------------------------------------------------------------
// Time helpers. Everything works in "minutes since midnight" so we never
// touch Date#toLocaleString or any locale-dependent formatting for parsing.
// ---------------------------------------------------------------------------

/** Parse "HH:MM" into minutes since midnight. Returns null if invalid. */
export function parseTimeToMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes since midnight for "right now", based on the browser's local clock. */
export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

/** Format minutes-since-midnight back into "HH:MM". */
export function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** true if `value` is a syntactically valid "HH:MM" string. */
export function isValidTime(value) {
  return parseTimeToMinutes(value) !== null;
}

/** Human-friendly duration like "50 min" or "1h 20m". */
export function formatDuration(startMinutes, endMinutes) {
  const total = Math.max(0, endMinutes - startMinutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
