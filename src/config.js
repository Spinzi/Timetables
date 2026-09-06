// ---------------------------------------------------------------------------
// Central configuration.
//
// BASE_PATH lets this app live at the root of a domain (Netlify, Vercel,
// custom domains, "user.github.io") or inside a sub-path
// ("user.github.io/repo-name"). Leave it empty for a root deployment.
// For a GitHub Pages *project* site, set it to "/your-repo-name".
// ---------------------------------------------------------------------------
export const BASE_PATH = '';

// Where the per-student JSON timetables live, relative to BASE_PATH.
export const DATA_DIR = `${BASE_PATH}/data`;

// Reserved routes that are never treated as a student's timetable name.
export const RESERVED_ROUTES = new Set(['', 'create', 'index.html']);

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// JS Date#getDay() -> 0 (Sunday) .. 6 (Saturday). Map that to our day names.
export const JS_DAY_INDEX_TO_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
