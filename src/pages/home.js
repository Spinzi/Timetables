import { el } from '../utils/dom.js';
import { navigate } from '../router.js';

export function homePage() {
  let nameValue = '';

  const goInput = el('input.go-form__input', {
    type: 'text',
    placeholder: 'e.g. Spinzi',
    'aria-label': 'Timetable name',
    on: {
      input: (e) => {
        nameValue = e.target.value.trim();
      },
      keydown: (e) => {
        if (e.key === 'Enter') go();
      },
    },
  });

  function go() {
    if (!nameValue) {
      goInput.focus();
      goInput.classList.add('go-form__input--error');
      setTimeout(() => goInput.classList.remove('go-form__input--error'), 600);
      return;
    }
    navigate(`/${encodeURIComponent(nameValue)}`);
  }

  return el('div.page.home', {}, [
    el('section.hero', {}, [
      el('div.hero__clock-badge', { text: 'NOW · Computer Science · 10:00–10:50' }),
      el('h1.hero__title', { text: 'Know what class you\u2019re in, instantly.' }),
      el('p.hero__subtitle', {
        text:
          'Timetables turns a school schedule into a live view of what you\u2019re doing right now and what\u2019s coming next \u2014 no app, no login, just a link.',
      }),
      el('div.hero__actions', {}, [
        el('a.button.button--primary', { href: '/create', text: 'Create your timetable' }),
        el('a.button.button--ghost', { href: '#go-to', text: 'I already have one' }),
      ]),
    ]),

    el('section.go-section', { id: 'go-to' }, [
      el('h2', { text: 'Open a timetable' }),
      el('p.go-section__hint', { text: 'Enter the name your timetable was published under.' }),
      el('div.go-form', {}, [
        el('span.go-form__prefix', { text: window.location.origin.replace(/^https?:\/\//, '') + '/' }),
        goInput,
        el('button.button.button--primary', { type: 'button', text: 'Open', on: { click: go } }),
      ]),
    ]),

    el('section.how-section', {}, [
      el('h2', { text: 'How it works' }),
      el('div.how-grid', {}, [
        howStep('1', 'Build it visually', 'Add your classes in the timetable creator \u2014 no JSON, no code.'),
        howStep('2', 'Download the file', 'Get a small JSON file with your week in it.'),
        howStep('3', 'Add it to the repo', 'Drop the file into the project\u2019s data folder on GitHub.'),
        howStep('4', 'Share your link', 'Your timetable is live at yoursite.com/YourName.'),
      ]),
    ]),
  ]);
}

function howStep(number, title, body) {
  return el('div.how-step', {}, [
    el('span.how-step__number', { text: number }),
    el('h3.how-step__title', { text: title }),
    el('p.how-step__body', { text: body }),
  ]);
}
