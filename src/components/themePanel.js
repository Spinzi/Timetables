import { el } from '../utils/dom.js';
import { THEMES } from '../themes/themes.js';
import { applyTheme, getActiveThemeName, getCustomVars, updateCustomVars } from '../themes/themeManager.js';

const CUSTOMIZABLE = [
  ['bg', 'Background'],
  ['surface', 'Cards'],
  ['primary', 'Primary / accent'],
  ['text', 'Text'],
  ['text-muted', 'Secondary text'],
  ['border', 'Borders'],
];

function swatchButton(key, theme) {
  const active = getActiveThemeName() === key;
  const preview = theme.vars.bg;
  const accent = theme.vars.primary;
  return el(
    `button.theme-swatch${active ? '.theme-swatch--active' : ''}`,
    {
      type: 'button',
      style: `--swatch-bg:${preview}; --swatch-accent:${accent};`,
      'aria-pressed': String(active),
      on: {
        click: () => {
          applyTheme(key);
          document.dispatchEvent(new CustomEvent('theme:changed'));
        },
      },
    },
    [el('span.theme-swatch__dot'), el('span.theme-swatch__label', { text: theme.label })],
  );
}

function customRow([key, label]) {
  const vars = getCustomVars();
  const input = el('input.theme-panel__color-input', {
    type: 'color',
    value: toHex(vars[key]),
    on: {
      input: (e) => {
        updateCustomVars({ [key]: e.target.value });
        applyTheme('custom');
      },
    },
  });
  return el('label.theme-panel__color-row', {}, [el('span', { text: label }), input]);
}

function toHex(value) {
  if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return '#6c8cff';
}

export function themePanel() {
  const swatches = el(
    'div.theme-panel__swatches',
    {},
    Object.entries(THEMES).map(([key, theme]) => swatchButton(key, theme)),
  );

  const customActive = getActiveThemeName() === 'custom';
  const customButton = el(
    `button.theme-swatch.theme-swatch--custom${customActive ? '.theme-swatch--active' : ''}`,
    {
      type: 'button',
      'aria-pressed': String(customActive),
      on: {
        click: () => {
          applyTheme('custom');
          document.dispatchEvent(new CustomEvent('theme:changed'));
        },
      },
    },
    [el('span.theme-swatch__dot', { text: '✎' }), el('span.theme-swatch__label', { text: 'Custom' })],
  );

  const customPanel = el(
    'div.theme-panel__custom',
    {},
    CUSTOMIZABLE.map(customRow),
  );

  return el('div.theme-panel', {}, [
    el('h3.theme-panel__title', { text: 'Appearance' }),
    swatches,
    customButton,
    customPanel,
  ]);
}
