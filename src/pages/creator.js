import { el, clear } from '../utils/dom.js';
import { DAY_NAMES } from '../config.js';
import { isValidTime, parseTimeToMinutes } from '../utils/time.js';
import { sortClasses } from '../timetable/sort.js';

let idCounter = 0;
const nextId = () => `c${Date.now().toString(36)}${(idCounter += 1)}`;

function emptyDays() {
  const days = {};
  for (const d of DAY_NAMES) days[d] = [];
  return days;
}

export function creatorPage() {
  const state = {
    name: '',
    days: emptyDays(),
    selectedDay: DAY_NAMES[0],
    editingId: null,
    errors: [],
  };

  const root = el('div.page.creator');

  const nameSection = el('section.creator__name-section');
  const editorSection = el('section.creator__editor');
  const exportSection = el('section.creator__export');

  root.append(
    el('header.creator__header', {}, [
      el('h1', { text: 'Build your timetable' }),
      el('p.creator__intro', {
        text: 'Add each class below. Nothing is uploaded \u2014 you\u2019ll download a JSON file at the end and add it to the project yourself.',
      }),
    ]),
    nameSection,
    editorSection,
    exportSection,
  );

  renderNameSection();
  renderEditor();
  renderExport();

  function renderNameSection() {
    clear(nameSection);
    const input = el('input.text-input', {
      type: 'text',
      placeholder: 'e.g. Spinzi',
      value: state.name,
      on: {
        input: (e) => {
          state.name = e.target.value;
          renderExport();
        },
      },
    });
    nameSection.append(
      el('label.field-label', { text: 'Your name (this becomes the URL)' }),
      el('div.name-field', {}, [
        el('span.name-field__prefix', { text: '/' }),
        input,
      ]),
    );
  }

  function renderEditor() {
    clear(editorSection);

    const tabs = el(
      'div.creator-tabs',
      { role: 'tablist' },
      DAY_NAMES.map((day) =>
        el(
          `button.creator-tab${day === state.selectedDay ? '.creator-tab--active' : ''}`,
          {
            type: 'button',
            text: `${day.slice(0, 3)}${state.days[day].length ? ` \u00b7 ${state.days[day].length}` : ''}`,
            on: {
              click: () => {
                state.selectedDay = day;
                state.editingId = null;
                renderEditor();
              },
            },
          },
        ),
      ),
    );

    const form = buildClassForm();
    const list = buildClassList();

    editorSection.append(tabs, form, list);
  }

  function buildClassForm() {
    const editing = state.editingId
      ? state.days[state.selectedDay].find((c) => c.id === state.editingId)
      : null;

    const nameInput = el('input.text-input', {
      type: 'text',
      placeholder: 'Class name (e.g. Mathematics)',
      value: editing ? editing.name : '',
    });
    const startInput = el('input.text-input.text-input--time', {
      type: 'time',
      value: editing ? editing.startTime : '',
    });
    const endInput = el('input.text-input.text-input--time', {
      type: 'time',
      value: editing ? editing.endTime : '',
    });
    const teacherInput = el('input.text-input', {
      type: 'text',
      placeholder: 'Teacher (optional)',
      value: editing && editing.teacher ? editing.teacher : '',
    });

    const errorBox = el('div.form-errors');

    function submit() {
      const errors = [];
      const name = nameInput.value.trim();
      const startTime = startInput.value.trim();
      const endTime = endInput.value.trim();
      const teacher = teacherInput.value.trim();

      if (!name) errors.push('Class name is required.');
      if (!isValidTime(startTime)) errors.push('Start time is required (HH:MM).');
      if (!isValidTime(endTime)) errors.push('End time is required (HH:MM).');
      if (isValidTime(startTime) && isValidTime(endTime)) {
        if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
          errors.push('End time must be after start time.');
        }
      }

      const dayClasses = state.days[state.selectedDay];
      const duplicate = dayClasses.find(
        (c) => c.id !== state.editingId && c.startTime === startTime && c.name.toLowerCase() === name.toLowerCase(),
      );
      if (duplicate) errors.push('That class already exists at that time.');

      clear(errorBox);
      if (errors.length) {
        errorBox.appendChild(
          el(
            'ul.form-errors__list',
            {},
            errors.map((msg) => el('li', { text: msg })),
          ),
        );
        return;
      }

      if (state.editingId) {
        const target = dayClasses.find((c) => c.id === state.editingId);
        Object.assign(target, { name, startTime, endTime, teacher: teacher || null });
        state.editingId = null;
      } else {
        dayClasses.push({ id: nextId(), name, startTime, endTime, teacher: teacher || null });
      }

      renderEditor();
      renderExport();
    }

    return el('div.class-form', {}, [
      el('div.class-form__row', {}, [nameInput]),
      el('div.class-form__row.class-form__row--times', {}, [
        el('label.field-label--inline', { text: 'Start' }),
        startInput,
        el('label.field-label--inline', { text: 'End' }),
        endInput,
      ]),
      el('div.class-form__row', {}, [teacherInput]),
      errorBox,
      el('div.class-form__actions', {}, [
        editing
          ? el('button.button.button--ghost', {
              type: 'button',
              text: 'Cancel edit',
              on: {
                click: () => {
                  state.editingId = null;
                  renderEditor();
                },
              },
            })
          : null,
        el('button.button.button--primary', {
          type: 'button',
          text: editing ? 'Save changes' : 'Add class',
          on: { click: submit },
        }),
      ]),
    ]);
  }

  function buildClassList() {
    const classes = sortClasses(state.days[state.selectedDay]);
    const wrapper = el('div.creator-list', { role: 'list' });

    if (classes.length === 0) {
      wrapper.appendChild(el('p.creator-list__empty', { text: `No classes added for ${state.selectedDay} yet.` }));
      return wrapper;
    }

    classes.forEach((c) => {
      const rawList = state.days[state.selectedDay];
      const idx = rawList.findIndex((x) => x.id === c.id);

      wrapper.appendChild(
        el('div.creator-item', { role: 'listitem' }, [
          el('div.creator-item__time', { text: `${c.startTime}\u2013${c.endTime}` }),
          el('div.creator-item__info', {}, [
            el('span.creator-item__name', { text: c.name }),
            c.teacher ? el('span.creator-item__teacher', { text: c.teacher }) : null,
          ]),
          el('div.creator-item__actions', {}, [
            el('button.icon-button', {
              type: 'button',
              'aria-label': 'Move up',
              text: '\u2191',
              disabled: idx === 0,
              on: { click: () => reorder(idx, -1) },
            }),
            el('button.icon-button', {
              type: 'button',
              'aria-label': 'Move down',
              text: '\u2193',
              disabled: idx === rawList.length - 1,
              on: { click: () => reorder(idx, 1) },
            }),
            el('button.icon-button', {
              type: 'button',
              'aria-label': 'Edit',
              text: '\u270e',
              on: {
                click: () => {
                  state.editingId = c.id;
                  renderEditor();
                },
              },
            }),
            el('button.icon-button.icon-button--danger', {
              type: 'button',
              'aria-label': 'Remove',
              text: '\u2715',
              on: {
                click: () => {
                  state.days[state.selectedDay] = rawList.filter((x) => x.id !== c.id);
                  renderEditor();
                  renderExport();
                },
              },
            }),
          ]),
        ]),
      );
    });

    return wrapper;
  }

  function reorder(index, delta) {
    const list = state.days[state.selectedDay];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    renderEditor();
  }

  function buildJSON() {
    const days = {};
    for (const day of DAY_NAMES) {
      days[day] = sortClasses(state.days[day]).map((c) => {
        const out = { startTime: c.startTime, endTime: c.endTime, name: c.name };
        if (c.teacher) out.teacher = c.teacher;
        return out;
      });
    }
    return { name: state.name.trim() || 'Untitled', days };
  }

  function totalClasses() {
    return DAY_NAMES.reduce((sum, d) => sum + state.days[d].length, 0);
  }

  function renderExport() {
    clear(exportSection);

    const json = JSON.stringify(buildJSON(), null, 2);
    const canExport = state.name.trim().length > 0 && totalClasses() > 0;

    const status = el('p.export-hint', {
      text: canExport
        ? `Download your timetable and add the JSON file to the timetable data folder as "${state.name.trim()}.json". Your timetable will then be available at /${state.name.trim()}.`
        : 'Give your timetable a name and add at least one class to enable export.',
    });

    const copyBtn = el('button.button.button--primary', {
      type: 'button',
      text: 'Copy JSON',
      disabled: !canExport,
      on: {
        click: async () => {
          try {
            await navigator.clipboard.writeText(json);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => (copyBtn.textContent = 'Copy JSON'), 1500);
          } catch {
            copyBtn.textContent = 'Copy failed \u2014 select manually';
          }
        },
      },
    });

    const downloadBtn = el('button.button.button--ghost', {
      type: 'button',
      text: 'Download JSON',
      disabled: !canExport,
      on: {
        click: () => {
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${state.name.trim() || 'timetable'}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        },
      },
    });

    exportSection.append(
      el('h2', { text: 'Export' }),
      status,
      el('div.export-actions', {}, [copyBtn, downloadBtn]),
      el('pre.json-preview', { text: json }),
    );
  }

  return root;
}
