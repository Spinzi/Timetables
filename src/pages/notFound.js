import { el } from '../utils/dom.js';

export function notFoundPage(name) {
  return el('div.page.not-found', {}, [
    el('div.not-found__card', {}, [
      el('span.not-found__code', { text: '404' }),
      el('h1', { text: name ? `No timetable called "${name}"` : 'Page not found' }),
      el('p', {
        text: name
          ? 'Check the spelling, or ask whoever manages your timetable for the right link.'
          : 'That page doesn\u2019t exist.',
      }),
      el('div.not-found__actions', {}, [
        el('a.button.button--primary', { href: '/', text: 'Go home' }),
        el('a.button.button--ghost', { href: '/create', text: 'Create a timetable' }),
      ]),
    ]),
  ]);
}
