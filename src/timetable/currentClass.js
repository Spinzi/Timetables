import { DAY_NAMES, JS_DAY_INDEX_TO_NAME } from '../config.js';
import { parseTimeToMinutes, nowMinutes } from '../utils/time.js';
import { sortClasses } from './sort.js';

export function todayName(date = new Date()) {
  return JS_DAY_INDEX_TO_NAME[date.getDay()];
}

/** Name of the day `offset` days after `date` (offset 0 = same day). */
export function dayNameWithOffset(date, offset) {
  const jsIndex = (date.getDay() + offset) % 7;
  return JS_DAY_INDEX_TO_NAME[jsIndex];
}

/**
 * Analyze one day's classes against a point in time.
 *
 * Returns:
 *  - status: 'no-classes' | 'before-first' | 'in-class' | 'between' | 'after-last'
 *  - current: the active class (status === 'in-class'), else null
 *  - next: the next class after `now` on this day, else null
 *  - upcoming: all classes strictly after the current/next one, in order
 *  - progress: 0..1 fraction through the current class (only when in-class)
 *  - all: the full sorted class list, each annotated with start/end minutes
 *
 * Pass `compareTime: false` when the day being analyzed is not "today" —
 * a future (or past) day can never have a currently-active class, no
 * matter what the clock says, since the clock only tells us a time of
 * day, not which calendar day it is.
 */
export function analyzeDay(classes, referenceDate = new Date(), { compareTime = true } = {}) {
  const sorted = sortClasses(classes).map((c) => ({
    ...c,
    _start: parseTimeToMinutes(c.startTime),
    _end: parseTimeToMinutes(c.endTime),
  }));

  const valid = sorted.filter((c) => c._start != null && c._end != null && c._end > c._start);

  if (valid.length === 0) {
    return { status: 'no-classes', current: null, next: null, upcoming: [], progress: 0, all: sorted };
  }

  if (!compareTime) {
    return {
      status: 'scheduled',
      current: null,
      next: valid[0],
      upcoming: valid.slice(1),
      progress: 0,
      all: valid,
    };
  }

  const now = nowMinutes(referenceDate);
  const current = valid.find((c) => now >= c._start && now < c._end) || null;
  const upcomingAll = valid.filter((c) => c._start >= (current ? current._end : now) && c !== current);
  const next = current
    ? upcomingAll[0] || null
    : valid.find((c) => c._start > now) || null;
  const upcoming = next ? upcomingAll.filter((c) => c !== next) : [];

  let status;
  if (current) status = 'in-class';
  else if (now < valid[0]._start) status = 'before-first';
  else if (now >= valid[valid.length - 1]._end) status = 'after-last';
  else status = 'between';

  const progress = current ? Math.min(1, Math.max(0, (now - current._start) / (current._end - current._start))) : 0;

  return { status, current, next, upcoming, progress, all: valid };
}

/**
 * Decide which day should be shown by default: today, unless today's
 * classes are completely finished (or today has none), in which case the
 * next day with any classes is used. If nothing in the whole week has
 * classes, `dayName` is still today's name but `hasAnyClasses` is false.
 */
export function pickDefaultDay(timetableDays, referenceDate = new Date()) {
  const today = todayName(referenceDate);
  const todayAnalysis = analyzeDay(timetableDays[today] || [], referenceDate);

  const todayHasRemaining =
    todayAnalysis.status !== 'no-classes' && todayAnalysis.status !== 'after-last';

  if (todayHasRemaining) {
    return { dayName: today, hasAnyClasses: true, isToday: true };
  }

  for (let offset = 1; offset <= 6; offset += 1) {
    const candidate = dayNameWithOffset(referenceDate, offset);
    if ((timetableDays[candidate] || []).length > 0) {
      return { dayName: candidate, hasAnyClasses: true, isToday: false };
    }
  }

  const anyClassesAtAll = DAY_NAMES.some((d) => (timetableDays[d] || []).length > 0);
  return { dayName: today, hasAnyClasses: anyClassesAtAll, isToday: true };
}
