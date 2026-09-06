import { el } from '../utils/dom.js';
import { formatDuration } from '../utils/time.js';
import { parseTimeToMinutes } from '../utils/time.js';

/**
 * @param {object} classItem - { name, startTime, endTime, teacher }
 * @param {object} [opts] - { badge: 'now'|'next'|null, progress: number }
 */
export function classCard(classItem, opts = {}) {
  const { badge = null, progress = 0 } = opts;
  const start = parseTimeToMinutes(classItem.startTime);
  const end = parseTimeToMinutes(classItem.endTime);
  const duration = start != null && end != null ? formatDuration(start, end) : null;

  const badgeNode =
    badge === 'now'
      ? el('span.class-card__badge.class-card__badge--now', { text: 'Now' })
      : badge === 'next'
        ? el('span.class-card__badge.class-card__badge--next', { text: 'Next' })
        : null;

  const progressBar =
    badge === 'now'
      ? el('div.class-card__progress-track', {}, [
          el('div.class-card__progress-fill', { style: `width: ${Math.round(progress * 100)}%` }),
        ])
      : null;

  return el(
    `div.class-card${badge === 'now' ? '.class-card--now' : ''}`,
    { role: 'listitem' },
    [
      el('div.class-card__time', {}, [
        el('span.class-card__time-range', { text: `${classItem.startTime}–${classItem.endTime}` }),
        duration ? el('span.class-card__duration', { text: duration }) : null,
      ]),
      el('div.class-card__body', {}, [
        el('div.class-card__heading', {}, [
          el('h3.class-card__name', { text: classItem.name }),
          badgeNode,
        ]),
        classItem.teacher ? el('p.class-card__teacher', { text: classItem.teacher }) : null,
      ]),
      progressBar,
    ],
  );
}

/** A small connector shown between consecutive class cards to hint a break. */
export function breakDivider(minutes) {
  if (minutes <= 0) return null;
  const label = minutes >= 60 ? `${Math.round(minutes / 60)}h break` : `${minutes} min break`;
  return el('div.break-divider', {}, [el('span', { text: label })]);
}
