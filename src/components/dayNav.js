import { el } from '../utils/dom.js';
import { DAY_NAMES } from '../config.js';

/**
 * @param {string} selectedDay
 * @param {(day:string)=>void} onSelect
 * @param {string} [todayName] - highlights today's chip distinctly
 */
export function dayNav(selectedDay, onSelect, todayName = null) {
  const chips = DAY_NAMES.map((day) => {
    const isSelected = day === selectedDay;
    const isToday = day === todayName;
    return el(
      `button.day-chip${isSelected ? '.day-chip--active' : ''}${isToday ? '.day-chip--today' : ''}`,
      {
        type: 'button',
        text: day.slice(0, 3),
        'aria-pressed': String(isSelected),
        on: { click: () => onSelect(day) },
      },
    );
  });

  const currentIndex = DAY_NAMES.indexOf(selectedDay);

  const prevBtn = el('button.day-nav__arrow', {
    type: 'button',
    'aria-label': 'Previous day',
    text: '‹',
    on: {
      click: () => onSelect(DAY_NAMES[(currentIndex + 6) % 7]),
    },
  });

  const nextBtn = el('button.day-nav__arrow', {
    type: 'button',
    'aria-label': 'Next day',
    text: '›',
    on: {
      click: () => onSelect(DAY_NAMES[(currentIndex + 1) % 7]),
    },
  });

  return el('nav.day-nav', { 'aria-label': 'Select day' }, [
    prevBtn,
    el('div.day-nav__chips', {}, chips),
    nextBtn,
  ]);
}
