import { parseTimeToMinutes } from '../utils/time.js';

/** Sort classes chronologically by startTime. Invalid times sink to the end. */
export function sortClasses(classes) {
  return [...classes].sort((a, b) => {
    const aStart = parseTimeToMinutes(a.startTime);
    const bStart = parseTimeToMinutes(b.startTime);
    if (aStart == null && bStart == null) return 0;
    if (aStart == null) return 1;
    if (bStart == null) return -1;
    return aStart - bStart;
  });
}
