import { el, clear } from '../utils/dom.js';
import { DAY_NAMES } from '../config.js';
import { loadTimetable, TimetableNotFoundError } from '../data/timetableLoader.js';
import { analyzeDay, pickDefaultDay, todayName } from '../timetable/currentClass.js';
import { classCard, breakDivider } from '../components/classCard.js';
import { dayNav } from '../components/dayNav.js';
import { getViewMode, setViewMode, getLastDay, setLastDay } from '../storage/preferences.js';

const REFRESH_MS = 20_000;

/**
 * @param {string} timetableName
 * @returns {Promise<{node: HTMLElement, cleanup: () => void}>}
 */
export async function viewerPage(timetableName) {
  const timetable = await loadTimetable(timetableName); // may throw TimetableNotFoundError

  const state = {
    viewMode: getViewMode(),
    selectedDay: getLastDay(timetableName) || pickDefaultDay(timetable.days).dayName,
  };

  // Re-anchor to "today" if we've never had a stored preference — makes the
  // very first visit smart, while respecting an explicit later choice.
  if (!getLastDay(timetableName)) {
    state.selectedDay = pickDefaultDay(timetable.days).dayName;
  }

  const root = el('div.page.viewer');
  const header = el('div.viewer__header');
  const body = el('div.viewer__body');
  root.append(header, body);

  function selectDay(day) {
    state.selectedDay = day;
    setLastDay(timetableName, day);
    render();
  }

  function selectView(mode) {
    state.viewMode = mode;
    setViewMode(mode);
    render();
  }

  function render() {
    clear(header);
    header.appendChild(renderHeader(timetable, state, selectView));

    clear(body);
    if (state.viewMode === 'day') {
      body.appendChild(renderDayView(timetable, state, selectDay));
    } else {
      body.appendChild(renderWeekView(timetable, state, selectDay));
    }
  }

  render();

  const interval = setInterval(() => {
    // Only the highlighting/status depends on the clock; a full re-render
    // is cheap here and keeps the logic in one place.
    render();
  }, REFRESH_MS);

  return { node: root, cleanup: () => clearInterval(interval) };
}

function renderHeader(timetable, state, selectView) {
  return el('div.viewer__top', {}, [
    el('div.viewer__identity', {}, [
      el('span.viewer__eyebrow', { text: 'Timetable' }),
      el('h1.viewer__name', { text: timetable.name }),
    ]),
    el('div.view-toggle', { role: 'tablist', 'aria-label': 'View mode' }, [
      el(`button.view-toggle__btn${state.viewMode === 'day' ? '.view-toggle__btn--active' : ''}`, {
        type: 'button',
        text: 'Today',
        on: { click: () => selectView('day') },
      }),
      el(`button.view-toggle__btn${state.viewMode === 'week' ? '.view-toggle__btn--active' : ''}`, {
        type: 'button',
        text: 'Week',
        on: { click: () => selectView('week') },
      }),
    ]),
  ]);
}

function renderDayView(timetable, state, selectDay) {
  const wrapper = el('div.day-view');
  const nav = dayNav(state.selectedDay, selectDay, todayName());
  wrapper.appendChild(nav);

  const classes = timetable.days[state.selectedDay] || [];
  const isToday = state.selectedDay === todayName();
  const analysis = analyzeDay(classes, new Date(), { compareTime: isToday });

  wrapper.appendChild(statusBanner(analysis, state.selectedDay, isToday, timetable.days));

  const list = el('div.class-list', { role: 'list' });

  if (analysis.all.length === 0) {
    list.appendChild(emptyDayCard());
  } else {
    analysis.all.forEach((c, idx) => {
      const badge = c === analysis.current ? 'now' : c === analysis.next ? 'next' : null;
      list.appendChild(classCard(c, { badge, progress: analysis.progress }));

      const following = analysis.all[idx + 1];
      if (following) {
        const gap = following._start - c._end;
        const divider = breakDivider(gap);
        if (divider) list.appendChild(divider);
      }
    });
  }

  wrapper.appendChild(list);
  return wrapper;
}

function statusBanner(analysis, dayName, isToday, allDays) {
  if (!isToday) {
    return el('p.status-banner.status-banner--muted', {
      text: `Showing ${dayName}\u2019s schedule.`,
    });
  }

  switch (analysis.status) {
    case 'no-classes': {
      const pick = pickDefaultDay(allDays);
      if (!pick.hasAnyClasses) {
        return el('p.status-banner', { text: 'No classes scheduled this week. Enjoy the break!' });
      }
      return el('p.status-banner', { text: 'No classes today.' });
    }
    case 'scheduled':
      return el('p.status-banner', {
        text: `First class starts at ${analysis.all[0].startTime}.`,
      });
    case 'before-first':
      return el('p.status-banner', { text: `First class starts at ${analysis.all[0].startTime}.` });
    case 'in-class':
      return el('p.status-banner.status-banner--live', {
        text: analysis.next
          ? `In class \u2014 up next: ${analysis.next.name} at ${analysis.next.startTime}.`
          : 'In class \u2014 last one of the day.',
      });
    case 'between':
      return el('p.status-banner', {
        text: analysis.next ? `On a break \u2014 next up: ${analysis.next.name} at ${analysis.next.startTime}.` : 'On a break.',
      });
    case 'after-last':
      return el('p.status-banner.status-banner--muted', { text: 'That\u2019s it for today \u2014 nicely done.' });
    default:
      return el('p.status-banner', { text: '' });
  }
}

function emptyDayCard() {
  return el('div.empty-day', {}, [
    el('span.empty-day__icon', { text: '\u2600\uFE0F' }),
    el('p', { text: 'No classes scheduled for this day.' }),
  ]);
}

function renderWeekView(timetable, state, selectDay) {
  const wrapper = el('div.week-view');
  const grid = el('div.week-grid');

  const today = todayName();

  for (const day of DAY_NAMES) {
    const classes = timetable.days[day] || [];
    const isToday = day === today;
    const analysis = analyzeDay(classes, new Date(), { compareTime: isToday });

    const column = el(
      `div.week-day${isToday ? '.week-day--today' : ''}${day === state.selectedDay ? '.week-day--selected' : ''}`,
      {
        on: { click: () => selectDay(day) },
        role: 'button',
        tabindex: '0',
      },
    );

    column.appendChild(el('div.week-day__header', {}, [
      el('span.week-day__name', { text: day }),
      isToday ? el('span.week-day__today-dot') : null,
    ]));

    const list = el('div.week-day__list');
    if (analysis.all.length === 0) {
      list.appendChild(el('p.week-day__empty', { text: 'Free' }));
    } else {
      analysis.all.forEach((c) => {
        const isCurrent = isToday && c === analysis.current;
        list.appendChild(
          el(`div.week-class${isCurrent ? '.week-class--now' : ''}`, {}, [
            el('span.week-class__time', { text: c.startTime }),
            el('span.week-class__name', { text: c.name }),
          ]),
        );
      });
    }
    column.appendChild(list);
    grid.appendChild(column);
  }

  wrapper.appendChild(grid);
  return wrapper;
}
