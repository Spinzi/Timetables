import { el, mount, clear } from './utils/dom.js';
import { initRouter, onRouteChange } from './router.js';
import { initTheme } from './themes/themeManager.js';
import { themePanel } from './components/themePanel.js';
import { homePage } from './pages/home.js';
import { creatorPage } from './pages/creator.js';
import { viewerPage } from './pages/viewer.js';
import { notFoundPage } from './pages/notFound.js';
import { TimetableNotFoundError } from './data/timetableLoader.js';

initTheme();

const app = document.getElementById('app');

const header = el('header.app-header', {}, [
  el('a.app-header__brand', { href: '/', text: 'Timetables' }),
  el('div.app-header__actions', {}, [
    el('a.app-header__link', { href: '/create', text: 'Create' }),
    el('button.app-header__settings', {
      type: 'button',
      'aria-label': 'Settings',
      text: '\u2699',
      on: { click: toggleSettings },
    }),
  ]),
]);

const settingsDrawer = el('div.settings-drawer', { hidden: true });
const overlay = el('div.settings-overlay', {
  hidden: true,
  on: { click: closeSettings },
});

const main = el('main.app-main');

document.body.prepend(overlay);
mount(app, el('div.app-shell', {}, [header, main, settingsDrawer]));

function toggleSettings() {
  const isHidden = settingsDrawer.hidden;
  if (isHidden) openSettings();
  else closeSettings();
}

function openSettings() {
  clear(settingsDrawer);
  settingsDrawer.appendChild(themePanel());
  settingsDrawer.appendChild(
    el('button.settings-drawer__close', { type: 'button', text: 'Done', on: { click: closeSettings } }),
  );
  settingsDrawer.hidden = false;
  overlay.hidden = false;
}

function closeSettings() {
  settingsDrawer.hidden = true;
  overlay.hidden = true;
}

document.addEventListener('theme:changed', () => {
  if (!settingsDrawer.hidden) openSettings();
});

let currentCleanup = null;

async function renderRoute(route) {
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }
  closeSettings();

  if (route.name === 'home') {
    mount(main, homePage());
    return;
  }

  if (route.name === 'create') {
    mount(main, creatorPage());
    return;
  }

  if (route.name === 'viewer') {
    mount(main, el('div.page-loading', {}, [el('span', { text: 'Loading timetable\u2026' })]));
    try {
      const { node, cleanup } = await viewerPage(route.timetableName);
      currentCleanup = cleanup;
      mount(main, node);
    } catch (err) {
      if (err instanceof TimetableNotFoundError) {
        mount(main, notFoundPage(route.timetableName));
      } else {
        mount(main, notFoundPage(route.timetableName));
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
    return;
  }

  mount(main, notFoundPage(null));
}

onRouteChange(renderRoute);
initRouter(); // fires the initial route render itself

