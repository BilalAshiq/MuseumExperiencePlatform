// Hide any broken exhibit image so its background block remains clean.
// Image error events do not bubble, so capture phase (true) catches them on document.
function setupImageFallback() {
  document.addEventListener("error", function (event) {
    if (event.target && event.target.tagName === "IMG") {
      event.target.style.display = "none";
    }
  }, true);
}

function setupMobileNav() {
  const toggleBtn = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  const header = document.querySelector(".site-header");

  if (!toggleBtn || !nav) {
    return;
  }

  function closeNav() {
    if (nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggleBtn.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open menu");
      if (header) {
        header.classList.remove("has-nav-open");
      }
    }
  }

  toggleBtn.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    toggleBtn.classList.toggle("is-open", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? "Close menu":"Open menu");
    if (header) {
      if (isOpen) {
        header.classList.add("has-nav-open");
        header.classList.remove("is-hidden");
      } else {
        header.classList.remove("has-nav-open");
      }
    }
  });

  // Close when pressing Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggleBtn.focus();
    }
  });

  // Close when viewport expands to desktop breakpoint
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 600 && nav.classList.contains("is-open")) {
      closeNav();
    }
  });
}

// Fixed header scroll behaviours:
// 1. On Home (< 40px): dark translucent tint over hero photo with cream text
// 2. Hide on scroll down past 120px with threshold >= 6px, show on scroll up
// 3. Keep visible when mobile nav is open, when header has keyboard focus, or at top
// 4. Subtle bottom border and shadow when scrolled > 10px
// 5. Dynamic sync of --header-h for page content padding
function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const isHome = header.classList.contains("site-header--home");
  const nav = document.getElementById("site-nav");
  let lastScrollY = window.scrollY || 0;
  let ticking = false;
  let headerHasFocus = false;

  function syncHeaderHeight() {
    const isNavOpen = nav && nav.classList.contains("is-open");
    if (!isNavOpen && header.offsetHeight) {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
  }

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  // Keep header visible while any element inside has keyboard focus
  header.addEventListener("focusin", function () {
    headerHasFocus = true;
    header.classList.remove("is-hidden");
  });

  header.addEventListener("focusout", function (event) {
    if (!header.contains(event.relatedTarget)) {
      headerHasFocus = false;
    }
  });

  function updateHeaderState() {
    const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);

    // 1. Home hero top state (< 40px scroll)
    if (isHome) {
      if (currentScrollY < 40) {
        header.classList.add("is-home-top");
      } else {
        header.classList.remove("is-home-top");
      }
    }

    // 2. Hide/show logic (past 120px with ~6px threshold)
    const isNavOpen = nav && nav.classList.contains("is-open");
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 120 || isNavOpen || headerHasFocus) {
      header.classList.remove("is-hidden");
    } else if (delta > 6) {
      // Scrolled DOWN -> slide up out of view
      header.classList.add("is-hidden");
    } else if (delta < -6) {
      // Scrolled UP -> slide back in
      header.classList.remove("is-hidden");
    }

    // 3. Scrolled border and shadow
    if (currentScrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateHeaderState();
}

// Alias for backward compatibility
const setupStickyHeader = setupHeaderScroll;

// Scroll fade-in: reveals .reveal elements smoothly as they enter viewport
function setupScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) {
    return;
  }

  // Progressive enhancement: only enable hidden starting state when JS is verified
  document.documentElement.classList.add("js-reveal");

  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });
}

// Hero staggered lift entrance on Home page
function triggerHeroStagger() {
  const heroContent = document.querySelector(".hero-full .hero-content");
  if (!heroContent || heroContent.classList.contains("is-lifted")) {
    return;
  }

  document.documentElement.classList.add("js-hero-stagger");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      heroContent.classList.add("is-lifted");
    });
  });
}

function updateNavVisitCount() {
  const countSpan = document.getElementById("nav-visit-count");
  if (!countSpan || typeof getFavourites !== "function") {
    return;
  }

  countSpan.textContent = String(getFavourites().length);
}

function buildSaveButton(exhibitId, isCompact) {
  const saved = typeof isFavorite === "function" && isFavorite(exhibitId);
  const label = saved ? "Saved" : "Save";
  const savedClass = saved ? " is-saved" : "";
  const compactClass = isCompact ? " card-bookmark-btn" : "";

  return `<button type="button" class="btn btn-secondary save-btn btn-bookmark${compactClass}${savedClass}" data-id="${exhibitId}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from Favorites' : 'Add to Favorites'}" title="${saved ? 'Saved' : 'Save'}"><svg class="bookmark-icon" width="16" height="16" viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span class="save-label${isCompact ? ' visually-hidden' : ''}">${label}</span></button>`;
}

function buildVisitButton(exhibitId) {
  const inVisit = typeof isFavourite === "function" && isFavourite(exhibitId);
  const label = inVisit ? "In My Visit" : "Add to My Visit";
  const visitClass = inVisit ? " is-in-visit" : "";

  return `<button type="button" class="btn btn-secondary visit-add-btn${visitClass}" data-id="${exhibitId}" aria-pressed="${inVisit}" aria-label="${inVisit ? 'Remove from My Visit' : 'Add to My Visit'}">${label}</button>`;
}

// One click listener on document handles every Save button, including cards re-rendered by filters.
function setupSaveButtons() {
  document.addEventListener("click", function (event) {
    const btn = event.target.closest ? event.target.closest(".save-btn") : (event.target.classList && event.target.classList.contains("save-btn") ? event.target : null);
    if (!btn) {
      return;
    }

    if (typeof toggleFavorite !== "function" || typeof isFavorite !== "function") {
      return;
    }

    const exhibitId = Number(btn.getAttribute("data-id"));
    if (!exhibitId) {
      return;
    }

    toggleFavorite(exhibitId);
    const savedNow = isFavorite(exhibitId);

    const matchingButtons = document.querySelectorAll('.save-btn[data-id="' + exhibitId + '"]');
    matchingButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(savedNow));
      button.setAttribute("aria-label", savedNow ? "Remove from Favorites" : "Add to Favorites");
      button.setAttribute("title", savedNow ? "Saved" : "Save");
      button.classList.toggle("is-saved", savedNow);

      const labelEl = button.querySelector(".save-label");
      if (labelEl) {
        labelEl.textContent = savedNow ? "Saved" : "Save";
      }

      const iconEl = button.querySelector(".bookmark-icon");
      if (iconEl) {
        iconEl.setAttribute("fill", savedNow ? "currentColor" : "none");
      }
    });

    renderFavoritesGrid();
  });
}

function setupVisitButtons() {
  document.addEventListener("click", function (event) {
    const btn = event.target.closest ? event.target.closest(".visit-add-btn") : (event.target.classList && event.target.classList.contains("visit-add-btn") ? event.target : null);
    if (!btn || typeof toggleFavourite !== "function" || typeof isFavourite !== "function") {
      return;
    }

    const exhibitId = Number(btn.getAttribute("data-id"));
    if (!exhibitId) {
      return;
    }

    toggleFavourite(exhibitId);
    const inVisit = isFavourite(exhibitId);
    const matchingButtons = document.querySelectorAll('.visit-add-btn[data-id="' + exhibitId + '"]');

    matchingButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(inVisit));
      button.setAttribute("aria-label", inVisit ? "Remove from My Visit" : "Add to My Visit");
      button.classList.toggle("is-in-visit", inVisit);
      button.textContent = inVisit ? "In My Visit" : "Add to My Visit";
    });

    updateNavVisitCount();
  });
}

// Build one exhibit card HTML string using the shared card structure.
function buildExhibitCard(exhibit, headingTag, matchedText) {
  const titleTag = headingTag || "h3";

  let recommendationContextHtml = "";
  if (matchedText) {
    const cleanMatches = typeof matchedText === "string"
      ? matchedText.replace(/^Matches:\s*/i, "").split(",").map(function (s) { return s.trim(); }).filter(Boolean)
      : (Array.isArray(matchedText) ? matchedText : []);

    if (cleanMatches.length > 0) {
      const chipsHtml = cleanMatches
        .map(function (chip) { return `<span class="matched-chip">${chip}</span>`; })
        .join("");

      recommendationContextHtml = `
        <div class="exhibit-recommendation-context">
          <div class="matched-chips" aria-label="Matched interests">
            ${chipsHtml}
          </div>
        </div>
      `;
    }
  }

  return `
    <article class="exhibit-card">
      <div class="exhibit-card-media">
        <a href="exhibit.html?id=${exhibit.id}" class="exhibit-card-media-link" aria-label="${exhibit.name}">
          <img src="${exhibit.image}" alt="${exhibit.name}" loading="lazy">
        </a>
        <div class="exhibit-card-actions">
          ${buildSaveButton(exhibit.id, true)}
        </div>
      </div>

      <div class="exhibit-card-body">
        <span class="exhibit-card-category">${exhibit.category}</span>
        <${titleTag} class="exhibit-card-title">
          <a href="exhibit.html?id=${exhibit.id}" class="exhibit-card-title-link">${exhibit.name}</a>
        </${titleTag}>
        <p class="exhibit-card-desc">${exhibit.description}</p>
        ${recommendationContextHtml}

        <div class="exhibit-card-footer">
          <div class="exhibit-card-meta">
            <span class="meta-item">
              <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span class="meta-period">${exhibit.period}</span>
            </span>
            <span class="meta-divider" aria-hidden="true">|</span>
            <span class="meta-item">
              <svg class="meta-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="meta-time">${exhibit.visitTime} min</span>
            </span>
          </div>

          <a href="exhibit.html?id=${exhibit.id}" class="exhibit-card-view-link">
            <span>View Exhibit</span>
            <span class="arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
        <div class="exhibit-card-visit-action">
          ${buildVisitButton(exhibit.id)}
        </div>
      </div>
    </article>
  `;
}

// Compute and render collection statistics dynamically on the Home page
function renderHomeStats() {
  const container = document.getElementById("home-stats");

  if (!container || typeof exhibits === "undefined" || exhibits.length === 0) {
    return;
  }

  const uniqueGalleries = [];
  let totalMinutes = 0;

  for (let i = 0; i < exhibits.length; i++) {
    if (!uniqueGalleries.includes(exhibits[i].gallery)) {
      uniqueGalleries.push(exhibits[i].gallery);
    }
    totalMinutes += exhibits[i].visitTime;
  }

  const galleryCount = uniqueGalleries.length;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  container.innerHTML = `
    <div class="stat-item">
      <span class="stat-number">${exhibits.length}</span>
      <span class="stat-label">Curated Exhibits</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${galleryCount}</span>
      <span class="stat-label">Museum Galleries</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">${timeFormatted}</span>
      <span class="stat-label">Full Route Time</span>
    </div>
  `;
}

// Render the 8 approved interests on the Home page with dynamic exhibit counts and descriptions
function renderHomeInterests() {
  const container = document.getElementById("home-interests");
  if (!container || typeof exhibits === "undefined" || typeof APPROVED_INTERESTS === "undefined") {
    return;
  }

  // Curated descriptions for the 8 visitor interest pathways
  const interestDescriptions = {
    "Ancient History": "Civilizations, daily life and the foundations of our world.",
    "Sculpture": "Three-dimensional works across time and cultures.",
    "Archaeology": "Artefacts and discoveries that uncover the human past.",
    "Painting": "Notable works and movements that shaped visual art.",
    "Medieval": "Art, life and culture from the medieval world.",
    "Textiles": "Fabrics, patterns and the craft of textile making.",
    "Natural History": "Fossils, specimens and the diversity of life on Earth.",
    "Modern Art": "Modern expressions and contemporary perspectives."
  };

  let html = "";
  for (let i = 0; i < APPROVED_INTERESTS.length; i++) {
    const interest = APPROVED_INTERESTS[i];
    let matchCount = 0;

    for (let j = 0; j < exhibits.length; j++) {
      const ex = exhibits[j];
      if (ex.category === interest || (ex.tags && ex.tags.includes(interest))) {
        matchCount += 1;
      }
    }

    const countWord = matchCount === 1 ? "exhibit" : "exhibits";
    const num = String(i + 1).padStart(2, "0");
    const desc = interestDescriptions[interest] || "Curated collection highlights and related exhibits.";

    html += `
      <a href="explore.html#discover" class="interest-cell">
        <span class="interest-num">${num}</span>
        <h3 class="interest-title">${interest}</h3>
        <p class="interest-desc">${desc}</p>
        <div class="interest-footer">
          <span class="interest-count">${matchCount} ${countWord}</span>
          <span class="interest-arrow" aria-hidden="true">&rarr;</span>
        </div>
      </a>
    `;
  }

  container.innerHTML = html;
}

function renderFeaturedExhibits() {
  const featuredGrid = document.getElementById("featured-grid");

  if (!featuredGrid || typeof exhibits === "undefined") {
    return;
  }

  let html = "";
  // Exhibits 2, 3 and 4 (indices 1, 2, 3) as starting recommendations
  for (let i = 1; i <= 3 && i < exhibits.length; i++) {
    html += buildExhibitCard(exhibits[i], "h3");
  }

  featuredGrid.innerHTML = html;
}

function renderExploreGrid(list) {
  const exploreGrid = document.getElementById("exhibit-grid");
  const countLine = document.getElementById("explore-count");

  if (!exploreGrid || typeof exhibits === "undefined") {
    return;
  }

  const items = list || exhibits;

  if (countLine) {
    const word = items.length === 1 ? "exhibit" : "exhibits";
    countLine.textContent = `Showing ${items.length} ${word}`;
  }

  if (items.length === 0) {
    exploreGrid.innerHTML = `<p class="muted-text explore-empty">No exhibits found in this category.</p>`;
    return;
  }

  let html = "";
  for (let i = 0; i < items.length; i++) {
    html += buildExhibitCard(items[i], "h2");
  }

  exploreGrid.innerHTML = html;
}

function renderFavoritesGrid() {
  const favoritesGrid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");

  if (!favoritesGrid || typeof exhibits === "undefined" || typeof getFavorites !== "function") {
    return;
  }

  const favoriteIds = getFavorites();
  const favoriteExhibits = exhibits.filter(function (exhibit) {
    return favoriteIds.includes(exhibit.id);
  });

  if (favoriteExhibits.length === 0) {
    favoritesGrid.innerHTML = "";
    favoritesGrid.hidden = true;
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  let html = "";
  for (let i = 0; i < favoriteExhibits.length; i++) {
    html += buildExhibitCard(favoriteExhibits[i], "h2");
  }

  favoritesGrid.innerHTML = html;
  favoritesGrid.hidden = false;
  if (emptyState) {
    emptyState.hidden = true;
  }
}

function setupCategoryFilters() {
  const filterBar = document.getElementById("category-filters");

  if (!filterBar || typeof exhibits === "undefined") {
    return;
  }

  const buttons = filterBar.querySelectorAll(".filter-btn");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      const selectedCategory = this.textContent.trim();

      for (let j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove("is-active");
        buttons[j].setAttribute("aria-pressed", "false");
      }

      this.classList.add("is-active");
      this.setAttribute("aria-pressed", "true");

      if (selectedCategory === "All") {
        renderExploreGrid(exhibits);
        return;
      }

      const filtered = exhibits.filter(function (exhibit) {
        return exhibit.category === selectedCategory;
      });

      renderExploreGrid(filtered);
    });
  }
}

function renderExhibitDetail() {
  const detailContainer = document.getElementById("exhibit-detail");

  if (!detailContainer || typeof exhibits === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const idValue = Number(params.get("id"));
  const exhibit = exhibits.find(function (item) {
    return item.id === idValue;
  });

  if (!exhibit) {
    document.title = "Exhibit Not Found — Museum Exploration Platform";
    detailContainer.innerHTML = `
      <div class="empty-state">
        <h1 class="empty-state-title">Exhibit not found</h1>
        <p class="empty-state-text">
          We could not find the exhibit you requested. Return to the collection catalogue to choose another item.
        </p>
        <a href="explore.html" class="btn btn-secondary">Browse all exhibits</a>
      </div>
    `;
    return;
  }

  document.title = `${exhibit.name} — Museum Exploration Platform`;

  let tagsHtml = "";
  for (let i = 0; i < exhibit.tags.length; i++) {
    tagsHtml += `<li class="tag-item">${exhibit.tags[i]}</li>`;
  }

  // Find previous and next exhibits by position in exhibits array (wrapping at both ends)
  const currentIndex = exhibits.indexOf(exhibit);
  const prevIndex = currentIndex === 0 ? exhibits.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === exhibits.length - 1 ? 0 : currentIndex + 1;
  const prevExhibit = exhibits[prevIndex];
  const nextExhibit = exhibits[nextIndex];

  detailContainer.innerHTML = `
    <div class="exhibit-detail-media">
      <img src="${exhibit.image}" alt="${exhibit.name}">
    </div>

    <div class="exhibit-detail-content">
      <p class="label exhibit-detail-category">${exhibit.category}</p>
      <h1 class="exhibit-detail-title">${exhibit.name}</h1>

      <dl class="exhibit-meta-list">
        <div class="exhibit-meta-row">
          <dt class="exhibit-meta-label">Period</dt>
          <dd class="exhibit-meta-value">${exhibit.period}</dd>
        </div>
        <div class="exhibit-meta-row">
          <dt class="exhibit-meta-label">Gallery</dt>
          <dd class="exhibit-meta-value">${exhibit.gallery} (Stop ${exhibit.stop})</dd>
        </div>
        <div class="exhibit-meta-row">
          <dt class="exhibit-meta-label">Visit time</dt>
          <dd class="exhibit-meta-value">${exhibit.visitTime} min</dd>
        </div>
      </dl>

      <div class="exhibit-detail-actions" id="exhibit-detail-actions">
        ${buildSaveButton(exhibit.id)}
        ${buildVisitButton(exhibit.id)}
      </div>

      <p class="exhibit-detail-description">${exhibit.description}</p>

      <div class="exhibit-detail-tags">
        <p class="label tags-heading">Related interests</p>
        <ul class="tag-list">
          ${tagsHtml}
        </ul>
      </div>
    </div>

    <nav class="exhibit-nav" aria-label="Exhibit navigation">
      <a href="exhibit.html?id=${prevExhibit.id}" class="exhibit-nav-item exhibit-nav-prev">
        <span class="exhibit-nav-label">Previous</span>
        <span class="exhibit-nav-title">${prevExhibit.name}</span>
      </a>
      <a href="exhibit.html?id=${nextExhibit.id}" class="exhibit-nav-item exhibit-nav-next">
        <span class="exhibit-nav-label">Next</span>
        <span class="exhibit-nav-title">${nextExhibit.name}</span>
      </a>
    </nav>
  `;
}

function renderInterestChips() {
  const chipsContainer = document.getElementById("interest-chips");
  if (!chipsContainer) {
    return;
  }

  const selectedInterests = typeof getInterests === "function" ? getInterests() : [];
  let html = "";

  for (let i = 0; i < APPROVED_INTERESTS.length; i++) {
    const interest = APPROVED_INTERESTS[i];
    const isSelected = selectedInterests.includes(interest);
    const selectedClass = isSelected ? " is-selected" : "";
    html += `<button type="button" class="chip${selectedClass}" data-interest="${interest}" aria-pressed="${isSelected}">${interest}</button>`;
  }

  chipsContainer.innerHTML = html;
}

// Score each exhibit by the number of selected interests it matches.
// Ties stay in a consistent catalogue order by exhibit id.
function getRecommendations(selectedInterests) {
  if (!Array.isArray(selectedInterests) || selectedInterests.length === 0) {
    return [];
  }

  const scored = [];

  for (let i = 0; i < exhibits.length; i++) {
    const exhibit = exhibits[i];
    const matched = [];

    if (selectedInterests.includes(exhibit.category)) {
      matched.push(exhibit.category);
    }

    for (let j = 0; j < exhibit.tags.length; j++) {
      const tag = exhibit.tags[j];
      if (selectedInterests.includes(tag)) {
        if (!matched.includes(tag)) {
          matched.push(tag);
        }
      }
    }

    const score = matched.length;
    if (score > 0) {
      scored.push({
        exhibit: exhibit,
        score: score,
        matched: matched
      });
    }
  }

  scored.sort(function (a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.exhibit.id - b.exhibit.id;
  });

  return scored;
}

function renderRecommendations(showResults) {
  const resultsGrid = document.getElementById("results");
  const summaryEl = document.getElementById("results-summary");
  const messageEl = document.getElementById("recommendations-message");

  if (!resultsGrid || !messageEl || typeof exhibits === "undefined" || typeof getInterests !== "function") {
    return;
  }

  const selectedInterests = getInterests();
  resultsGrid.innerHTML = "";
  if (summaryEl) {
    summaryEl.textContent = "";
    summaryEl.hidden = true;
  }

  if (selectedInterests.length === 0) {
    messageEl.textContent = "Select one or more interests, then choose Find Recommendations.";
    return;
  }

  if (!showResults) {
    messageEl.textContent = "Your interests are selected. Choose Find Recommendations to see matching exhibits.";
    return;
  }

  const recommendations = getRecommendations(selectedInterests);

  if (recommendations.length === 0) {
    messageEl.textContent = "No exhibits matched those interests. Try different interests or reset your selection.";
    if (summaryEl) {
      summaryEl.hidden = false;
      summaryEl.textContent = "Showing 0 matching exhibits.";
    }
    return;
  }

  messageEl.textContent = "";
  if (summaryEl) {
    summaryEl.hidden = false;
    const word = recommendations.length === 1 ? "exhibit" : "exhibits";
    summaryEl.textContent = `Showing ${recommendations.length} recommended ${word} for ${selectedInterests.join(", ")}.`;
  }

  let html = "";
  for (let i = 0; i < recommendations.length; i++) {
    const item = recommendations[i];
    html += buildExhibitCard(item.exhibit, "h3", item.matched.join(", "));
  }

  resultsGrid.innerHTML = html;
}

function setupInterestChips() {
  const chipsContainer = document.getElementById("interest-chips");
  if (chipsContainer && typeof toggleInterest === "function") {
    chipsContainer.addEventListener("click", function (event) {
      if (!event.target.classList || !event.target.classList.contains("chip")) {
        return;
      }

      const interest = event.target.getAttribute("data-interest");
      if (!interest) {
        return;
      }

      const updated = toggleInterest(interest);
      const isSelected = updated.includes(interest);
      event.target.classList.toggle("is-selected", isSelected);
      event.target.setAttribute("aria-pressed", String(isSelected));
      renderRecommendations(false);
    });
  }

  const findButton = document.getElementById("find-recommendations");
  if (findButton) {
    findButton.addEventListener("click", function () {
      renderRecommendations(true);
    });
  }

  const resetButton = document.getElementById("reset-interests");
  if (resetButton && chipsContainer && typeof saveInterests === "function") {
    resetButton.addEventListener("click", function () {
      saveInterests([]);
      renderInterestChips();
      renderRecommendations(false);
    });
  }
}

// Build the visitor's route by looking up saved exhibits and sorting a copy
// by galleryOrder ascending first, then by stop ascending within each gallery.
function getVisitRouteExhibits() {
  const favIds = getFavourites();
  const matched = [];

  for (let i = 0; i < favIds.length; i++) {
    const exhibit = exhibits.find(function (item) {
      return item.id === favIds[i];
    });
    if (exhibit) {
      matched.push(exhibit);
    }
  }

  const route = matched.slice();
  route.sort(function (a, b) {
    if (a.galleryOrder !== b.galleryOrder) {
      return a.galleryOrder - b.galleryOrder;
    }
    return a.stop - b.stop;
  });

  return route;
}

function formatTotalTime(totalMinutes) {
  const unit = totalMinutes === 1 ? "minute" : "minutes";
  const baseText = `${totalMinutes} ${unit}`;

  if (totalMinutes <= 60) {
    return baseText;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${baseText} (${hours} h)`;
  }

  return `${baseText} (${hours} h ${minutes} min)`;
}

function renderVisitRoute() {
  const routeEl = document.getElementById("visit-route");
  const summaryBar = document.getElementById("visit-summary-bar");
  const summaryText = document.getElementById("visit-summary");
  const emptyState = document.getElementById("visit-empty");

  if (!routeEl || typeof exhibits === "undefined" || typeof getFavourites !== "function") {
    return;
  }

  const routeExhibits = getVisitRouteExhibits();

  if (routeExhibits.length === 0) {
    routeEl.innerHTML = "";
    routeEl.hidden = true;
    routeEl.style.display = "none";
    if (summaryBar) {
      summaryBar.hidden = true;
      summaryBar.style.display = "none";
    }
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.style.display = "flex";
    }
    return;
  }

  let totalMinutes = 0;
  for (let i = 0; i < routeExhibits.length; i++) {
    totalMinutes += routeExhibits[i].visitTime;
  }

  routeEl.hidden = false;
  routeEl.style.display = "";
  if (summaryBar) {
    summaryBar.hidden = false;
    summaryBar.style.display = "flex";
  }
  if (emptyState) {
    emptyState.hidden = true;
    emptyState.style.display = "none";
  }

  if (summaryText) {
    const stopWord = routeExhibits.length === 1 ? "stop" : "stops";
    let timeDetail = "";
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      timeDetail = minutes > 0 ? ` (${hours} h ${minutes} min total)` : ` (${hours} h total)`;
    }

    summaryText.innerHTML = `
      <div class="visit-metric-item">
        <svg class="visit-metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span class="visit-metric-val">${routeExhibits.length} ${stopWord}</span>
      </div>
      <span class="visit-metric-divider" aria-hidden="true"></span>
      <div class="visit-metric-item">
        <svg class="visit-metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="visit-metric-val">${totalMinutes} minutes</span>
        ${timeDetail ? `<span class="visit-metric-detail">${timeDetail}</span>` : ""}
      </div>
    `;
  }

  // Group exhibits by gallery while preserving the sorted walking sequence
  const galleryGroups = [];
  let currentGroup = null;

  for (let i = 0; i < routeExhibits.length; i++) {
    const item = routeExhibits[i];
    if (!currentGroup || currentGroup.gallery !== item.gallery) {
      currentGroup = {
        gallery: item.gallery,
        stops: []
      };
      galleryGroups.push(currentGroup);
    }
    currentGroup.stops.push({
      exhibit: item,
      stopNumber: i + 1
    });
  }

  let html = "";

  for (let g = 0; g < galleryGroups.length; g++) {
    const group = galleryGroups[g];
    let galleryMinutes = 0;
    for (let s = 0; s < group.stops.length; s++) {
      galleryMinutes += group.stops[s].exhibit.visitTime;
    }
    const stopCount = group.stops.length;
    const gStopWord = stopCount === 1 ? "stop" : "stops";

    html += `
      <section class="visit-gallery-group" aria-label="${group.gallery}">
        <div class="visit-gallery-header">
          <h2 class="visit-gallery-title">${group.gallery}</h2>
          <div class="visit-gallery-meta">
            <span>${stopCount} ${gStopWord} · ${galleryMinutes} minutes</span>
            <svg class="visit-gallery-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </div>
        </div>
        <div class="visit-gallery-list">
    `;

    for (let s = 0; s < group.stops.length; s++) {
      const stop = group.stops[s];
      const item = stop.exhibit;

      html += `
        <article class="visit-card visit-stop" data-id="${item.id}">
          <div class="visit-card-left">
            <span class="visit-stop-badge visit-marker" aria-label="Stop ${stop.stopNumber}">${stop.stopNumber}</span>
            <a href="exhibit.html?id=${item.id}" class="visit-card-thumb-link" aria-hidden="true" tabindex="-1">
              <img src="${item.image}" alt="" class="visit-card-thumb" loading="lazy">
            </a>
            <div class="visit-card-content">
              <p class="visit-card-category">${item.category}</p>
              <h3 class="visit-card-title">
                <a href="exhibit.html?id=${item.id}">${item.name}</a>
              </h3>
              <p class="visit-card-meta">${item.period} · ${item.visitTime} min</p>
            </div>
          </div>
          <button type="button" class="btn-visit-remove remove-fav-btn" data-id="${item.id}" aria-label="Remove ${item.name} from visit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Remove</span>
          </button>
        </article>
      `;
    }

    html += `
        </div>
      </section>
    `;
  }

  routeEl.innerHTML = html;
}

function setupVisitRemove() {
  const routeEl = document.getElementById("visit-route");

  if (!routeEl || typeof toggleFavourite !== "function") {
    return;
  }

  routeEl.addEventListener("click", function (event) {
    const btn = event.target.closest(".remove-fav-btn");
    if (!btn) {
      return;
    }

    const exhibitId = Number(btn.getAttribute("data-id"));
    if (!exhibitId) {
      return;
    }

    toggleFavourite(exhibitId);
    updateNavVisitCount();
    renderVisitRoute();
  });
}

function setupClearVisit() {
  const clearBtn = document.getElementById("clear-visit-btn");

  if (!clearBtn || typeof saveFavourites !== "function") {
    return;
  }

  clearBtn.addEventListener("click", function () {
    const confirmed = window.confirm("Remove all saved exhibits from your visit?");
    if (!confirmed) {
      return;
    }

    saveFavourites([]);
    updateNavVisitCount();
    renderVisitRoute();
  });
}

// Reload if a browser restores the page from back/forward cache (bfcache)
// so saved counts and button states stay in sync with localStorage.
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  setupImageFallback();
  triggerHeroStagger();
  setupMobileNav();
  setupStickyHeader();
  updateNavVisitCount();
  setupSaveButtons();
  setupVisitButtons();
  renderHomeInterests();
  renderHomeStats();
  renderFeaturedExhibits();
  renderExploreGrid();
  renderFavoritesGrid();
  setupCategoryFilters();
  renderExhibitDetail();
  renderInterestChips();
  renderRecommendations(false);
  setupInterestChips();
  renderVisitRoute();
  setupVisitRemove();
  setupClearVisit();
  setupScrollReveal();
});
