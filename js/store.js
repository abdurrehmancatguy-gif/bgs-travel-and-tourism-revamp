import { ACTIVITIES, PACKAGES } from "../data/packages.js?v=54";
import { DESTINATIONS, VISA_TYPES, PAGE_COPY } from "../data/content.js?v=54";
import { MICE_SECTIONS } from "../data/mice.js?v=54";
import { SERVICES } from "../data/navigation.js?v=54";

/**
 * The single door between the site's content and where that content lives.
 *
 * Today it is the bundled `data/*.js` files with any admin edits layered on top
 * from localStorage. Tomorrow it is Firestore: only the four functions at the
 * bottom of this file change, and every page keeps working untouched. That is
 * the whole point of routing reads through here rather than importing the data
 * modules directly.
 *
 * Edits are stored as a full replacement list per collection, not as a diff.
 * Diffs are smaller but they rot the moment the shipped defaults change, and a
 * travel catalogue is small enough that clarity wins.
 */

const STORAGE_KEY = "bgs.content.v1";

/** The shipped content. Restoring a collection means coming back to this. */
const DEFAULTS = {
  activities: ACTIVITIES,
  packages: PACKAGES,
  destinations: DESTINATIONS,
  services: SERVICES,
  visa: VISA_TYPES,
  mice: MICE_SECTIONS,
  copy: PAGE_COPY,
};

export const COLLECTIONS = Object.keys(DEFAULTS);

const listeners = new Set();

function readOverlay() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    // A corrupt blob should degrade to the shipped content, not a blank site.
    console.warn("store: overlay unreadable, falling back to defaults");
    return {};
  }
}

function writeOverlay(overlay) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  listeners.forEach((fn) => fn());
}

/** Deep clone so callers cannot mutate the defaults by accident. */
const clone = (value) => JSON.parse(JSON.stringify(value));

/* ------------------------------------------------------------------ reads */

export function getCollection(name) {
  if (!(name in DEFAULTS)) throw new Error(`store: unknown collection "${name}"`);
  const overlay = readOverlay();
  return clone(overlay[name] ?? DEFAULTS[name]);
}

export function isCustomised(name) {
  return name in readOverlay();
}

/** Fires whenever anything is saved — this is what makes edits sync live. */
export function subscribe(fn) {
  listeners.add(fn);
  // Another tab writing to localStorage fires `storage` here, not in the tab
  // that wrote it. That is what lets the admin tab update an open site tab.
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/* ----------------------------------------------------------------- writes */

export function saveCollection(name, items) {
  if (!(name in DEFAULTS)) throw new Error(`store: unknown collection "${name}"`);
  const overlay = readOverlay();
  overlay[name] = items;
  writeOverlay(overlay);
}

export function resetCollection(name) {
  const overlay = readOverlay();
  delete overlay[name];
  writeOverlay(overlay);
}

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((fn) => fn());
}

/** Everything the admin has changed, for backup before a risky edit. */
export function exportAll() {
  const overlay = readOverlay();
  return JSON.stringify(
    Object.fromEntries(COLLECTIONS.map((c) => [c, overlay[c] ?? DEFAULTS[c]])),
    null,
    2
  );
}

export function importAll(json) {
  const parsed = JSON.parse(json);
  const unknown = Object.keys(parsed).filter((k) => !(k in DEFAULTS));
  if (unknown.length) throw new Error(`unknown collections: ${unknown.join(", ")}`);
  writeOverlay(parsed);
}
