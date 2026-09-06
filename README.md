# Timetables

A static, no-backend website for school timetables. Visit `/YourName` and
instantly see what class you're in right now and what's next — no login,
no app, no database. Timetable data lives as plain JSON files in this repo.

## How it works

- `/` — landing page: create a timetable, or jump to an existing one.
- `/create` — a visual timetable builder. No JSON editing required.
- `/AnyName` — loads `data/AnyName.json` and shows that timetable, with
  live "now / next" detection based on the visitor's browser clock.

There is no build step and no server. Everything runs in the browser as
plain ES modules, and timetable data is just static JSON fetched at
runtime.

## Adding a new timetable

1. Go to `/create` and build the schedule visually.
2. Click **Download JSON**.
3. Add the downloaded file to the `data/` folder in this repository,
   named exactly as you want the URL to be, e.g. `data/Maria.json` →
   available at `/Maria`.
4. Commit and push (or open a PR). No other code changes are needed.

### JSON format

```json
{
  "name": "Spinzi",
  "days": {
    "Monday": [
      { "startTime": "08:00", "endTime": "08:50", "name": "Mathematics", "teacher": "Mrs. Popescu" }
    ],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  }
}
```

- Times are 24-hour `HH:MM`, parsed manually so they never depend on a
  visitor's locale.
- `teacher` is optional; every other field is required.
- Missing days or empty arrays are fine — the app is robust to days with
  no classes.

Two sample files are included (`data/Spinzi.json`, `data/Alex.json`) so
you can try the app immediately at `/Spinzi` and `/Alex`.

## Running locally

No install, no bundler. Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL.

## Deploying

This is a static site — deploy the whole folder as-is.

- **Netlify**: drag-and-drop the folder, or connect the repo. The
  included `_redirects` file makes deep links like `/Spinzi` work.
- **GitHub Pages**: push this repo and enable Pages. The included
  `404.html` implements the standard `spa-github-pages` redirect trick
  so a direct visit to `/Spinzi` works even though GitHub Pages can't
  do server-side rewrites.
  - If you're deploying to a **project site**
    (`https://username.github.io/repo-name`), open `src/config.js` and
    set `BASE_PATH = '/repo-name'`. For a **user/organization site** or
    a custom domain at the root, leave it as `''`.
- **Vercel / any static host**: serving `index.html` for unknown paths
  (SPA fallback) is all that's required.

## Project structure

```text
/
├── index.html            entry point
├── 404.html              GitHub Pages SPA fallback
├── _redirects            Netlify SPA fallback
├── styles/
│   └── main.css          theme variables + all styling
├── data/
│   ├── Spinzi.json       sample timetable
│   └── Alex.json         sample timetable
└── src/
    ├── config.js         base path & shared constants
    ├── main.js            app shell / route rendering
    ├── router.js          history-API based client-side routing
    ├── data/
    │   └── timetableLoader.js   fetch + normalize timetable JSON
    ├── timetable/
    │   ├── sort.js               chronological sorting
    │   └── currentClass.js       current/next class + default-day logic
    ├── themes/
    │   ├── themes.js              theme token definitions
    │   └── themeManager.js        applies CSS variables, custom theme
    ├── storage/
    │   └── preferences.js         all localStorage access
    ├── components/
    │   ├── classCard.js
    │   ├── dayNav.js
    │   └── themePanel.js
    ├── pages/
    │   ├── home.js
    │   ├── creator.js
    │   ├── viewer.js
    │   └── notFound.js
    └── utils/
        ├── dom.js
        └── time.js
```

## Adding a new theme

Open `src/themes/themes.js` and add a new entry to the `THEMES` object
with a `label` and a `vars` map (background, surface, text, accent
colors, etc.). It appears in the theme picker automatically — nothing
else needs to change, since every color in the app is a CSS custom
property.

## Notes

- Timetable *data* always comes from the JSON files, never from
  `localStorage`. Only preferences (theme, last-viewed day, view mode)
  are stored locally, per browser.
- The app never depends on the visitor's system locale to parse times —
  `HH:MM` strings are parsed manually.
