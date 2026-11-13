// Storage helpers for visitor favourites and interests using browser localStorage.
// localStorage only stores text strings, so JSON.stringify converts arrays to text
// when saving, and JSON.parse converts that text back into an array when reading.

const APPROVED_INTERESTS = [
  "Ancient History",
  "Sculpture",
  "Archaeology",
  "Painting",
  "Medieval",
  "Textiles",
  "Natural History",
  "Modern Art"
];

// Return valid numeric exhibit IDs from localStorage, or [] if missing/corrupted.
function getFavourites() {
  try {
    const raw = localStorage.getItem("favourites");
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(function (id) {
      return typeof id === "number";
    });
  } catch (error) {
    return [];
  }
}

function saveFavourites(favIds) {
  try {
    localStorage.setItem("favourites", JSON.stringify(favIds));
  } catch (error) {
    // Ignore storage errors so pages still work when storage is disabled or full.
  }
}

function isFavourite(id) {
  const favs = getFavourites();
  return favs.includes(id);
}

function toggleFavourite(id) {
  const favs = getFavourites();
  let updated;

  if (favs.includes(id)) {
    updated = favs.filter(function (itemId) {
      return itemId !== id;
    });
  } else {
    updated = favs.slice();
    updated.push(id);
  }

  saveFavourites(updated);
  return updated;
}

// Storage helpers for visitor interests; keep only approved strings without duplicates.
function getInterests() {
  try {
    const raw = localStorage.getItem("interests");
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const clean = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (typeof item === "string" && APPROVED_INTERESTS.includes(item) && !clean.includes(item)) {
        clean.push(item);
      }
    }

    return clean;
  } catch (error) {
    return [];
  }
}

function saveInterests(interests) {
  try {
    localStorage.setItem("interests", JSON.stringify(interests));
  } catch (error) {
    // Ignore storage errors so pages still work when storage is disabled or full.
  }
}

function toggleInterest(interest) {
  const selected = getInterests();
  let updated;

  if (selected.includes(interest)) {
    updated = selected.filter(function (item) {
      return item !== interest;
    });
  } else {
    updated = selected.slice();
    updated.push(interest);
  }

  saveInterests(updated);
  return updated;
}

