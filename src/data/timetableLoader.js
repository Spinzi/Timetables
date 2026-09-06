import { DATA_DIR, DAY_NAMES } from '../config.js';

const cache = new Map();

/** Build an empty { Monday: [], Tuesday: [], ... } skeleton. */
function emptyDays() {
  const days = {};
  for (const day of DAY_NAMES) days[day] = [];
  return days;
}

/**
 * Normalize a raw parsed JSON object into a predictable shape so the rest
 * of the app never has to guard against missing days or malformed classes.
 */
function normalize(raw, fallbackName) {
  const days = emptyDays();
  const rawDays = raw && typeof raw.days === 'object' ? raw.days : {};

  for (const day of DAY_NAMES) {
    const list = Array.isArray(rawDays[day]) ? rawDays[day] : [];
    days[day] = list
      .filter((c) => c && typeof c.name === 'string' && c.name.trim().length > 0)
      .map((c) => ({
        name: c.name.trim(),
        startTime: typeof c.startTime === 'string' ? c.startTime : '',
        endTime: typeof c.endTime === 'string' ? c.endTime : '',
        teacher: typeof c.teacher === 'string' && c.teacher.trim() ? c.teacher.trim() : null,
      }));
  }

  return {
    name: (raw && typeof raw.name === 'string' && raw.name.trim()) || fallbackName,
    days,
  };
}

/**
 * Load `/data/<name>.json`. Returns the normalized timetable, or throws a
 * `TimetableNotFoundError` if the file is missing (404) or malformed.
 */
export async function loadTimetable(name, { skipCache = false } = {}) {
  if (!skipCache && cache.has(name)) return cache.get(name);

  let response;
  try {
    response = await fetch(`${DATA_DIR}/${encodeURIComponent(name)}.json`, {
      cache: 'no-cache',
    });
  } catch {
    throw new TimetableNotFoundError(name);
  }

  if (!response.ok) {
    throw new TimetableNotFoundError(name);
  }

  let raw;
  try {
    raw = await response.json();
  } catch {
    throw new TimetableNotFoundError(name);
  }

  const timetable = normalize(raw, name);
  cache.set(name, timetable);
  return timetable;
}

export class TimetableNotFoundError extends Error {
  constructor(name) {
    super(`Timetable "${name}" was not found.`);
    this.name = 'TimetableNotFoundError';
    this.timetableName = name;
  }
}
