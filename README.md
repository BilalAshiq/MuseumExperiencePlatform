# The Halden Museum — Museum Visitor Experience Platform

Academic web project for **CSE326 Internet Programming** (Lovely Professional University, Semester 1) by **Nazmul, Bilal, and Bhoomika**.

## Purpose

Visitors in a large museum often cannot see everything in one trip. This frontend-only website lets a visitor pick subjects they care about, see ranked exhibit recommendations, save favourites across pages, and view an ordered walking route through the museum's four galleries with an estimated total visit time.

## How to Run

No installation, backend server, database, or build step is required.

- **Direct file open:** Open `index.html` in Chrome, Edge, or Firefox.
- **Simple local server (optional):** Run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

## File Structure

- `index.html` — Home page with the museum introduction, guide, interests and stats.
- `explore.html` — Full exhibit catalogue, category filters and the separate interest-recommendation section.
- `favorites.html` — Saved exhibits with actions to remove a favorite or add an exhibit to My Visit.
- `exhibit.html` — Exhibit detail page reading `?id=` from the URL.
- `visit.html` — My Visit itinerary with the ordered route, total time, Remove buttons and Clear all.
- `css/style.css` — Shared styles, responsive layouts and museum typography/palette tokens.
- `js/data.js` — Fixed array (`exhibits`) of 16 exhibit objects replacing a backend database.
- `js/storage.js` — Approved interests and `localStorage` helpers for Favorites, My Visit and interests.
- `js/script.js` — Shared page rendering, event listeners, recommendation ranking and route sorting.
- `images/` — Exhibit photography and the Home hero image.
- `imp/PRD.md` — Product Requirements Document.
- `imp/AGENTS.md` — Engineering rules and academic/viva guidelines.
- `imp/ANTIGRAVITY_BUILD_PLAYBOOK.md` — Phase-by-phase build playbook.
- `imp/Elite Design Upgrade Complete Prompt Playbook.md` — Design implementation notes.
- `README.md` — Project overview, architecture guide, and viva summary.

## How Core Features Work

- **Exhibit catalogue (`js/data.js`, `js/script.js`):** `exhibits` holds 16 exhibit objects. `buildExhibitCard()` supplies the shared card design to the catalogue, recommendations, Favorites and exhibit detail page.
- **Category filters (`explore.html`, `js/script.js`):** `setupCategoryFilters()` filters the catalogue by `exhibit.category`, updates the active filter state and re-renders only the catalogue grid. There is no existing name-search feature.
- **Interests and recommendations (`js/storage.js`, `js/script.js`):** the 8 approved interests are selected independently of the category filters. Find Recommendations counts how many selected interests match an exhibit's category and tags; higher counts appear first, with exhibit ID as a consistent tie-breaker. Reset clears the selected interests. Cards show the matched interests.
- **Favorites (`favorites.html`, `js/storage.js`, `js/script.js`):** `getFavorites()`, `saveFavorites()`, `isFavorite()` and `toggleFavorite()` store exhibit IDs under the separate `"favorites"` localStorage key. The shared Save/Saved button toggles Favorites on cards and detail pages.
- **My Visit (`visit.html`, `js/storage.js`, `js/script.js`):** the existing `"favourites"` key continues to hold the route's exhibit IDs, preserving existing route data. The separate Add to My Visit action updates that list. `getVisitRouteExhibits()` sorts by `galleryOrder` and `stop`; `renderVisitRoute()` groups stops and totals visit time. Removing or clearing route stops does not change Favorites.
- **Interests persistence:** selected recommendation interests remain under the `"interests"` localStorage key.
- **Exhibit details (`exhibit.html`, `js/script.js`):** `renderExhibitDetail()` reads `?id=` with `URLSearchParams`, finds the exhibit, and renders its full metadata, Favorite and My Visit actions, or a friendly not-found message.

## Design Notes

The site uses a fixed light palette, Cormorant Garamond headings, Inter body text, shared exhibit cards and responsive layouts. The header, interests, catalogue filters and buttons use the same visual language throughout the pages. The Home page retains its hero, guide, interests and data-driven stats. Scroll controls and the dark-mode toggle are not part of the current interface.

## How to Add a New Exhibit

Add one object to the `exhibits` array in `data.js` with no other code changes needed:

1. Use a unique numeric `id` (never reuse old IDs).
2. Set `category` to one of the 8 approved subjects (`Ancient History`, `Sculpture`, `Archaeology`, `Painting`, `Medieval`, `Textiles`, `Natural History`, `Modern Art`).
3. Set `tags` to an array of other subjects from the same 8 (never repeating `category`).
4. Set `gallery` and `galleryOrder` (`1`: `Gallery 1, Ancient World`; `2`: `Gallery 2, Medieval and Textiles`; `3`: `Gallery 3, Natural History`; `4`: `Gallery 4, Painting and Modern Art`) and the next `stop` number in that gallery.
5. Add `period`, a 40–70 word `description`, `visitTime` (minutes), and `image` (`"images/your-exhibit-name.jpg"`).

## Technologies Used and Why

- **HTML5, CSS3, Vanilla JavaScript:** Matches first-semester coursework so every team member can read and explain every line in a viva without framework abstractions.
- **`localStorage` (no PHP/MySQL):** Favorites, My Visit route IDs and selected interests stay in the visitor's browser; no login, backend or database is required.
- **Google Fonts (`Cormorant Garamond` and `Inter`):** Provides editorial museum typography with system font fallbacks.

## Known Limitations

- **Per-browser persistence:** Favorites, My Visit route IDs and selected interests live only in `localStorage` on one browser and device; clearing site data erases them.
- **Fixed sample data:** The 16 exhibits are static objects stored in `data.js` rather than an admin database.
- **Schematic gallery route:** The visit route orders stops by `galleryOrder` and `stop` sequence, not physical walking distances, floor coordinates, stairs, or lift access.

## Images and Credits

*To be completed when images are added.*

Exhibit photographs and the Home hero photo are added by the team inside the `images/` folder. Each file must use lowercase words joined by hyphens matching the exhibit (for example `images/standing-bronze-figure.jpg`) as referenced by the `image` field in `data.js`, cropped to `4:3` and compressed to about `150 KB`. Photographer/archive credits will be listed here and in the shared site footer once the image files are placed in `images/`.

