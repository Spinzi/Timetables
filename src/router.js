import { BASE_PATH, RESERVED_ROUTES } from './config.js';

const listeners = new Set();

/** Strip BASE_PATH and leading/trailing slashes to get the route's raw path. */
function currentPath() {
  let path = window.location.pathname;
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    path = path.slice(BASE_PATH.length);
  }
  return path.replace(/^\/+|\/+$/g, '');
}

/** Parse the current location into a route descriptor. */
export function parseRoute() {
  const path = currentPath();

  if (RESERVED_ROUTES.has(path)) {
    return path === 'create' ? { name: 'create' } : { name: 'home' };
  }

  // A single path segment is treated as a timetable name, e.g. "/Spinzi".
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1) {
    return { name: 'viewer', timetableName: decodeURIComponent(segments[0]) };
  }

  return { name: 'not-found', path };
}

/** Navigate to a new in-app path without a full page reload. */
export function navigate(path, { replace = false } = {}) {
  const full = `${BASE_PATH}/${path}`.replace(/\/{2,}/g, '/');
  if (replace) {
    window.history.replaceState({}, '', full);
  } else {
    window.history.pushState({}, '', full);
  }
  emit();
}

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  const route = parseRoute();
  listeners.forEach((fn) => fn(route));
}

export function initRouter() {
  window.addEventListener('popstate', emit);

  // Intercept clicks on same-origin, non-modified left-clicks to enable
  // client-side navigation from plain <a href="/Name"> links.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    let path = url.pathname;
    if (BASE_PATH && path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length);
    navigate(path.replace(/^\/+/, ''), { replace: false });
  });

  emit();
}
