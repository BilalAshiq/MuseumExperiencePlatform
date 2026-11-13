# Museum Exploration Platform

Academic web project for **CSE326 Internet Programming** (Lovely Professional University, Semester 1) by **Nazmul, Bilal, and Bhoomika**.

## Purpose

Visitors in a large museum often cannot see everything in one trip. This frontend-only website lets a visitor pick subjects they care about, see ranked exhibit recommendations, save favourites across pages, and view an ordered walking route through the museum's four galleries with an estimated total visit time.

## How to Run

No installation, backend server, database, or build step is required.

- **Direct file open:** Open `index.html` in Chrome, Edge, or Firefox.
- **Simple local server (optional):** Run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

## File Structure

- `index.html` — Home page with museum introduction, 3-step guide, and featured exhibits.
- `explore.html` — Full 16-exhibit catalogue with category filter buttons.
- `exhibit.html` — Single exhibit detail page reading `?id=` from the URL.
- `discover.html` — Interest chip selector and rule-based ranked recommendations.
- `visit.html` — "My Visit" itinerary showing the ordered gallery route, total time, Remove buttons, and Clear all.
- `css/style.css` — Stylesheet containing CSS variables, responsive layouts, and museum typography/palette tokens.
- `js/data.js` — Fixed array (`exhibits`) of 16 exhibit objects replacing a backend database.
- `js/storage.js` — `APPROVED_INTERESTS` list plus `localStorage` helpers for `"favourites"` and `"interests"`.
- `js/script.js` — Page rendering, event listeners, recommendation scoring, and route sorting logic.
- `images/` — Folder containing exhibit photos, the Home hero photo, and the custom SVG logo emblem.
- `PRD.md` — Product Requirements Document (single source of truth for scope and rules).
- `README.md` — Project overview, architecture guide, and viva summary.

## How Core Features Work

- **Exhibit catalogue (`data.js`, `script.js`):** `exhibits` holds 16 exhibit objects. `buildExhibitCard()` builds shared card HTML; `renderFeaturedExhibits()` draws the first 3 cards on `index.html`, and `renderExploreGrid()` draws the catalogue on `explore.html`.
- **Category filter (`explore.html`, `script.js`):** `setupCategoryFilters()` attaches click handlers to `.filter-btn` buttons, filters `exhibits` by matching `exhibit.category` (or restores all 16 on `All`), updates active button states (`aria-pressed`, `.is-active`), and calls `renderExploreGrid()`.
- **Interests and recommendations (`storage.js`, `script.js`):** `renderInterestChips()` and `setupInterestChips()` render the 8 subjects from `APPROVED_INTERESTS` and persist selections via `getInterests()` and `toggleInterest()`. `getRecommendations()` scores every exhibit (`+2` if `category` matches, `+1` per matching tag), keeps scores above `0`, sorts descending (breaking ties by ascending `id`), and `renderRecommendations()` displays cards with `"Matches: ..."` labels.
- **Favourites (`storage.js`, `script.js`):** `getFavourites()`, `saveFavourites()`, `isFavourite()`, and `toggleFavourite()` persist an array of saved exhibit IDs in `localStorage` using `JSON.stringify` and `JSON.parse` wrapped in `try/catch`. `buildSaveButton()`, one delegated `document` click handler in `setupSaveButtons()`, and `updateNavVisitCount()` keep `"Save"`/`"Saved"` buttons and `My Visit (N)` synced across all five pages. `pageshow` reloads pages restored from browser back/forward cache (`bfcache`).
- **Visit route (`visit.html`, `script.js`):** `getVisitRouteExhibits()` reads saved IDs, looks up each exhibit in `exhibits`, and sorts a copy by `galleryOrder` ascending then `stop` ascending. `renderVisitRoute()` groups stops under gallery headings whenever the gallery changes, numbers stops continuously (`1, 2, 3...`), and totals `visitTime` with `formatTotalTime()` (adding hours and minutes when over 60 minutes). `setupVisitRemove()` and `setupClearVisit()` handle single-stop removal and `"Clear all"` confirmation.
- **Exhibit details (`exhibit.html`, `script.js`):** `renderExhibitDetail()` reads `?id=` with `URLSearchParams`, locates the exhibit with `exhibits.find()`, renders its full metadata and Save button, or displays a friendly `"Exhibit not found"` message if the ID is missing or invalid.

## Design Notes

The final design of Museum Exploration Platform introduces several polished interactive features built strictly in vanilla JavaScript and CSS variables:

1. **Theme System (`style.css`, `storage.js`):** Light and dark palettes are defined using CSS variables in `:root` and overridden inside `[data-theme="dark"]`. The site sets `document.documentElement.setAttribute('data-theme', theme)` and stores the choice under the `"theme"` key in `localStorage` so the visitor's preference persists across pages and reloads. An anti-flash inline script in the `<head>` of every HTML page applies the saved theme before the body renders to prevent white screen flashes.
2. **Dark Mode Toggle (`script.js`):** A text-only button in the header reads `DARK` in the light theme and `LIGHT` in the dark theme with no decorative icons. Clicking it toggles `data-theme` between `"light"` and `"dark"`, updates `aria-pressed`, and saves to `localStorage`.
3. **Back to Top Button (`script.js`):** A fixed circular button with an accessible SVG arrow appears at the bottom right once the user scrolls past 600px. Clicking it smoothly scrolls the page back to the top (or instantly if `prefers-reduced-motion` is active) and returns focus to the site brand link.
4. **Scroll Progress Bar (`script.js`):** A 2px high accent-colored bar fixed to the top of the viewport (`#scroll-progress`) dynamically widens from 0% to 100% as the visitor scrolls down the page.
5. **Scroll Fade-in (`script.js`):** An `IntersectionObserver` detects when elements with the `.reveal` class enter the viewport and smoothly fades them in with a slight upward glide. It stops observing each element once revealed. If JavaScript is disabled, content remains fully visible.
6. **One-Time Intro Loader (`script.js`):** When visiting the Home page (`index.html`) for the first time in a browsing session, an elegant museum title screen with an animated progress line displays briefly and fades out. It sets the `"loaderSeen"` key in `sessionStorage` so it appears only once per session and never interrupts returning visits.
7. **Dynamic Stats Band (`index.html`, `script.js`):** A full-width dark anchor band on the Home page computes three collection figures directly from `data.js` using plain JavaScript loops: total exhibit count (`16`), unique museum galleries (`4`), and total walking route time (`2h 29m`).

## How to Add a New Exhibit

Add one object to the `exhibits` array in `data.js` with no other code changes needed:

1. Use a unique numeric `id` (never reuse old IDs).
2. Set `category` to one of the 8 approved subjects (`Ancient History`, `Sculpture`, `Archaeology`, `Painting`, `Medieval`, `Textiles`, `Natural History`, `Modern Art`).
3. Set `tags` to an array of other subjects from the same 8 (never repeating `category`).
4. Set `gallery` and `galleryOrder` (`1`: `Gallery 1, Ancient World`; `2`: `Gallery 2, Medieval and Textiles`; `3`: `Gallery 3, Natural History`; `4`: `Gallery 4, Painting and Modern Art`) and the next `stop` number in that gallery.
5. Add `period`, a 40–70 word `description`, `visitTime` (minutes), and `image` (`"images/your-exhibit-name.jpg"`).

## Technologies Used and Why

- **HTML5, CSS3, Vanilla JavaScript:** Matches first-semester coursework so every team member can read and explain every line in a viva without framework abstractions.
- **`localStorage` (no PHP/MySQL):** No login, user accounts, or shared visitor data are required, so saving `"favourites"` and `"interests"` in the browser keeps the site static, zero-setup, and reliable offline.
- **Google Fonts (`Playfair Display` and `Inter`):** Gives editorial museum typography while keeping system serif/sans fallbacks offline.

## Known Limitations

- **Per-browser persistence:** Saved favourites and selected interests live only in `localStorage` on one browser and device; clearing site data erases them.
- **Fixed sample data:** The 16 exhibits are static objects stored in `data.js` rather than an admin database.
- **Schematic gallery route:** The visit route orders stops by `galleryOrder` and `stop` sequence, not physical walking distances, floor coordinates, stairs, or lift access.

## Images and Credits

*To be completed when images are added.*

Exhibit photographs and the Home hero photo are added by the team inside the `images/` folder. Each file must use lowercase words joined by hyphens matching the exhibit (for example `images/standing-bronze-figure.jpg`) as referenced by the `image` field in `data.js`, cropped to `4:3` and compressed to about `150 KB`. Photographer/archive credits will be listed here and in the shared site footer once the image files are placed in `images/`.

