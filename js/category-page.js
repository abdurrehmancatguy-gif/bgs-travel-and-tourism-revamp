import { getCollection, subscribe } from "./store.js?v=83";
import "./info-modal.js?v=83";
import { createNavigation } from "./navigation.js?v=83";
import { icon } from "../data/icons.js?v=83";
import { priceLabel } from "../data/packages.js?v=83";
import { openWhatsApp, buildWhatsAppUrl } from "../utils/whatsapp.js?v=83";
import { MICE_SERVICES } from "../data/mice.js?v=83";
import { openItem } from "./item-dialog.js?v=83";

/**
 * Every category page runs this one module. The page declares which collection
 * it shows with `data-collection` on <body>; everything else — the header, the
 * search box, the chips, the cards, the live re-render when the admin saves —
 * is identical, so a new category page is an HTML file and nothing more.
 *
 * The search box is pre-filled from `?q=`, which is how the dropdown deep links
 * work: picking "Desert" under Activities lands here with "Desert" searched and
 * the list already filtered.
 */

const page = document.body.dataset.collection;
const grid = document.querySelector("#card-grid");
const input = document.querySelector("#page-search-input");
const clearBtn = document.querySelector("#page-search-clear");
const chipRow = document.querySelector("#page-chips");
const countEl = document.querySelector("#page-count");

/* ------------------------------------------------------ per-collection shape */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * What each collection puts on a card, what its filter chips are, and which of
 * its fields the search box looks at. Adding a category page means adding an
 * entry here.
 */
const SHAPES = {
  activities: {
    chips: (items) => [...new Set(items.flatMap((i) => i.tags ?? []))].sort(),
    search: (i) => [i.title, i.category, i.destination, ...(i.tags ?? [])],
    card: (i) => cardMarkup({
      image: i.image, alt: i.title, iconName: i.icon, kicker: i.category,
      title: i.title, body: i.shortDescription,
      meta: [i.duration, priceLabel(i), `${i.rating.toFixed(1)} ★`],
    }),
  },
  packages: {
    chips: (items) =>
      [...new Set(items.flatMap((i) => [i.region, ...(i.tags ?? [])]))].sort(),
    search: (i) => [i.title, i.category, i.region, i.destination, ...(i.tags ?? [])],
    card: (i) => cardMarkup({
      image: i.image, alt: i.title, iconName: i.icon, kicker: i.category,
      title: i.title, body: i.shortDescription,
      meta: [i.duration, priceLabel(i), `${i.rating.toFixed(1)} ★`],
    }),
  },
  destinations: {
    chips: (items) => [...new Set(items.map((i) => i.region))],
    search: (i) => [i.name, i.region],
    card: (i) => cardMarkup({
      image: i.image, alt: i.name, kicker: i.region, title: i.name,
      body: i.blurb, meta: [`Best time: ${i.bestTime}`],
    }),
  },
  services: {
    chips: () => [],
    search: (i) => [i.label, i.blurb],
    card: (i) => cardMarkup({
      iconName: i.icon, kicker: "Service", title: i.label, body: i.blurb, meta: [],
    }),
  },
  mice: {
    chips: (items) => items.map((i) => i.name),
    // Every item name is searchable, so "Gala" finds Corporate Events even
    // though the section is not called that.
    search: (i) => [i.name, ...(i.items ?? [])],
    card: (i) => cardMarkup({
      image: i.image, alt: i.name, iconName: i.icon, kicker: "MICE",
      title: i.name, body: i.blurb, list: i.items,
    }),
  },
  visa: {
    chips: (items) => [...new Set(items.map((i) => i.country))],
    search: (i) => [i.name, i.country],
    card: (i) => cardMarkup({
      image: i.image, alt: i.name, iconName: "visa", kicker: i.country,
      title: i.name, body: i.blurb,
      meta: [i.processing, i.validity],
    }),
  },
};

/**
 * Cards display at roughly 380px while these URLs are 2400-3840px renditions —
 * six times the pixels needed. Rewriting the width in the path does NOT work:
 * Wikimedia serves only the exact rendition its API generated, and 640, 800 and
 * 1024 all 404 for a file whose 3840 loads fine. The fix is to request the
 * smaller size at resolve time (iiurlwidth) and store both, which is a change to
 * data/photos.js rather than something this renderer can do.
 */
function cardMarkup({ image, alt, iconName, kicker, title, body, meta = [], list = [] }) {
  // Package photography is stored as { src, alt } while destination and visa
  // images are plain strings, so accept either rather than forcing one shape.
  const src = typeof image === "string" ? image : image?.src;
  const altText = (typeof image === "object" && image?.alt) || alt || title;
  image = src;
  alt = altText;
  return `
    <li class="item-card reveal" role="button" tabindex="0"
        aria-label="${esc(title)} — enquire on WhatsApp" data-title="${esc(title)}">
      ${image ? `<div class="item-card-media">
        <img src="${esc(image)}" alt="${esc(alt || title)}" loading="lazy" />
        ${iconName ? `<span class="item-card-icon" aria-hidden="true">${icon(iconName)}</span>` : ""}
      </div>` : ""}
      <div class="item-card-inner">
        ${kicker ? `<p class="item-card-kicker">${esc(kicker)}</p>` : ""}
        <h3>${esc(title)}</h3>
        <p>${esc(body ?? "")}</p>
        ${list.length ? `<ul class="item-card-list">
          ${list.map((entry) => `<li>${esc(entry)}</li>`).join("")}
        </ul>` : ""}
        ${meta.length ? `<p class="item-card-meta">
          ${meta.map((m, n) => `<span class="${
            n === 0 ? "item-card-duration" : n === meta.length - 1 && meta.length > 2
              ? "item-card-rating" : "item-card-price"
          }">${esc(m)}</span>`).join("")}
        </p>` : ""}
      </div>
    </li>`;
}

/* -------------------------------------------------------------- filtering */

const shape = SHAPES[page];
let items = getCollection(page);
/* What is on screen right now, in DOM order. The click handler indexes into
   this rather than searching by title — two records may share a title, and the
   filtered order is the only thing the grid and this array agree on. */
let visibleItems = [];
let query = new URLSearchParams(location.search).get("q") || "";

const matches = (item, q) => {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  return shape
    .search(item)
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(needle));
};

function render() {
  const visible = items.filter((item) => matches(item, query));
  visibleItems = visible;

  grid.innerHTML = visible.length
    ? visible.map(shape.card).join("")
    : "";
  // Stamped after render rather than woven through every shape's card builder.
  grid.querySelectorAll(".item-card").forEach((el, i) => { el.dataset.idx = i; });

  const empty = document.querySelector("#page-empty");
  empty.hidden = visible.length > 0;
  if (!visible.length) {
    empty.querySelector("[data-empty-query]").textContent = query;
  }

  countEl.textContent = query
    ? `${visible.length} of ${items.length} matching “${query}”`
    : `${items.length} ${items.length === 1 ? "result" : "results"}`;

  chipRow.querySelectorAll(".page-chip").forEach((chip) => {
    chip.dataset.active = String(
      chip.dataset.value.toLowerCase() === query.trim().toLowerCase()
    );
  });

  clearBtn.hidden = !query;
  revealCards();
}

/** Headline and intro are editable too, so they come from the store as well. */
function renderCopy() {
  const copy = getCollection("copy")[page];
  if (!copy) return;
  const title = document.querySelector("#page-title");
  const intro = document.querySelector("#page-intro");
  if (copy.title) title.textContent = copy.title;
  if (copy.intro) intro.textContent = copy.intro;
}

function renderChips() {
  const values = shape.chips(items);
  chipRow.innerHTML = values
    .map((v) => `<button class="page-chip" type="button" data-value="${esc(v)}">${esc(v)}</button>`)
    .join("");
}

/** Keeps the URL shareable: the search you see is the search you can send. */
function setQuery(next, { push = true } = {}) {
  query = next;
  if (input.value !== next) input.value = next;
  if (push) {
    const url = new URL(location.href);
    if (next) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }
  render();
}

/* --------------------------------------------------------- scroll reveal */

let revealObserver = null;

function revealCards() {
  if (!revealObserver) return;
  document.querySelectorAll(".reveal:not([data-shown])").forEach((el) => {
    revealObserver.observe(el);
  });
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Only hide things once we know we can bring them back.
  document.body.classList.add("reveal-ready");
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger within a batch so a grid row arrives as a wave, not a flash.
        const delay = Math.min(i * 70, 350);
        setTimeout(() => { entry.target.dataset.shown = "true"; }, delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
}

/* ------------------------------------------------------------------ wiring */

export function routeAction(action) {
  if (!action) return;
  if (action.kind === "page") {
    const url = action.q
      ? `${action.page}.html?q=${encodeURIComponent(action.q)}`
      : `${action.page}.html`;
    location.href = url;
    return;
  }
  if (action.kind === "scene") { location.href = `index.html#scene-${action.scene}`; return; }
  if (action.kind === "service") { location.href = "services.html"; return; }
  if (action.kind === "whatsapp") openWhatsApp(buildWhatsAppUrl(action.intent));
}

createNavigation({
  nav: document.querySelector("#site-nav"),
  drawer: document.querySelector("#nav-drawer"),
  drawerBody: document.querySelector("#nav-drawer-body"),
  toggle: document.querySelector("#nav-toggle"),
  onAction: routeAction,
});

/* The MICE page carries a strip of what is handled on any booking. Rendered
   here rather than hardcoded so the list lives with the rest of the data. */
const miceServices = document.querySelector("#mice-services-list");
if (miceServices) {
  miceServices.innerHTML = MICE_SERVICES.map((s) => `<li>${esc(s)}</li>`).join("");
}

setupReveal();
renderCopy();
renderChips();
setQuery(query, { push: false });

input.addEventListener("input", () => setQuery(input.value));
clearBtn.addEventListener("click", () => { setQuery(""); input.focus(); });

chipRow.addEventListener("click", (event) => {
  const chip = event.target.closest(".page-chip");
  if (!chip) return;
  // Clicking the active chip clears it, so chips toggle rather than trap.
  setQuery(chip.dataset.active === "true" ? "" : chip.dataset.value);
});

/* A card opens its detail panel. The WhatsApp enquiry moved inside that panel,
   so it happens after someone has read the detail rather than instead of it. */
grid.addEventListener("click", (event) => {
  const card = event.target.closest(".item-card");
  if (card) openItem(visibleItems[Number(card.dataset.idx)], page);
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".item-card");
  if (!card) return;
  event.preventDefault();
  openItem(visibleItems[Number(card.dataset.idx)], page);
});

// The admin saves to the same store; this is what makes an edit appear on an
// open page without a refresh.
subscribe(() => {
  items = getCollection(page);
  renderCopy();
  renderChips();
  render();
});
