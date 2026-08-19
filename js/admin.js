import {
  COLLECTIONS, getCollection, saveCollection, resetCollection, resetAll,
  exportAll, importAll, isCustomised, isCloudEnabled,
} from "./store.js?v=130";
import { photoQuery } from "./photo-query.mjs?v=130";
import { CARD_TITLE_KEY } from "../data/packages.js?v=130";
import { signIn } from "./cloud.js?v=130";

/**
 * The admin console.
 *
 * READ THIS BEFORE TRUSTING THE PASSWORD. This is a static site with no server,
 * so the gate below runs entirely in the visitor's browser. Anyone who opens
 * devtools can read the stored hash, bypass the check, or edit localStorage
 * directly. It keeps a casual visitor out of the editor; it is not security.
 *
 * That is why the login below switches when a Firebase project is configured:
 * it stops checking a local hash and signs in against Firebase Auth instead,
 * and the Firestore rules reject writes from anyone who is not signed in. The
 * gate then lives on Google's servers where a browser cannot argue with it.
 *
 * With no project configured it falls back to the local password, which keeps
 * a casual visitor out of the editor and nothing more. Treat that mode as a
 * convenience lock on a glass door and put nothing sensitive behind it.
 */

const AUTH_KEY = "bgs.admin.v1";
const DEFAULT_PASSWORD = "bgs-admin";

/* --------------------------------------------------------------- password */

/**
 * SHA-256 so the plain password is not sitting in localStorage. It is *not* a
 * password hash in the security sense — no salt, no work factor — because the
 * threat model above means a stronger one would buy nothing.
 */
async function hash(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const readAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}"); } catch { return {}; }
};
const writeAuth = (data) => localStorage.setItem(AUTH_KEY, JSON.stringify(data));

async function currentHash() {
  const auth = readAuth();
  return auth.hash || (await hash(DEFAULT_PASSWORD));
}

async function checkPassword(value) {
  return (await hash(value)) === (await currentHash());
}

export async function changePassword(next) {
  writeAuth({ ...readAuth(), hash: await hash(next) });
}

export const isDefaultPassword = async () =>
  (await currentHash()) === (await hash(DEFAULT_PASSWORD));

/* ------------------------------------------------------------------ fields */

/**
 * What the editor shows for each collection. `key` is the property, `type`
 * drives the input, and `label` is what the admin sees. Anything not listed is
 * preserved untouched on save, so adding a field to the data does not silently
 * drop it here.
 */
const FIELDS = {
  // packages had a tab all along — renderTabs builds those from COLLECTIONS —
  // but no entry here, so the one collection the homepage carousel draws from
  // was the one nobody could edit.
  packages: [
    ["title", "Title", "text"], ["slug", "Slug", "text"],
    ["category", "Category", "text"], ["region", "Region", "text"],
    ["destination", "Destination", "text"],
    ["destinationKey", "Destination key", "text"],
    ["duration", "Duration", "text"], ["price", "Price", "number"],
    ["currency", "Currency", "text"], ["priceUnit", "Price unit", "text"],
    ["rating", "Rating", "number"], ["tags", "Tags (comma separated)", "list"],
    ["shortDescription", "Short description", "textarea"],
    ["fullDescription", "Full description", "textarea"],
    ["highlights", "Highlights (comma separated)", "list"],
    ["included", "Included (comma separated)", "list"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["image", "Image", "photo"], ["icon", "Icon", "text"],
  ],
  // The three pills under the hero headline. `query` names one record and its
  // panel opens on arrival; empty lands on the whole section.
  homePills: [
    ["label", "Button text", "text"],
    ["page", "Goes to (visa / mice / packages / activities / destinations / services)", "text"],
    ["query", "Opens this record (exact name, or empty for the whole section)", "text"],
  ],
  activities: [
    ["title", "Title", "text"], ["slug", "Slug", "text"],
    ["category", "Category", "text"], ["destination", "Destination", "text"],
    ["destinationKey", "Destination key", "text"], ["region", "Region", "text"],
    ["duration", "Duration", "text"], ["price", "Price", "number"],
    ["currency", "Currency", "text"], ["priceUnit", "Price unit", "text"],
    ["rating", "Rating", "number"], ["tags", "Tags (comma separated)", "list"],
    ["shortDescription", "Short description", "textarea"],
    ["fullDescription", "Full description", "textarea"],
    ["highlights", "Highlights (comma separated)", "list"],
    ["included", "Included (comma separated)", "list"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["image", "Image", "photo"], ["icon", "Icon", "text"],
  ],
  destinations: [
    ["name", "Name", "text"], ["key", "Key", "text"], ["region", "Region", "text"],
    ["bestTime", "Best time to go", "text"],
    ["blurb", "Description", "textarea"],
    ["fullDescription", "Full description", "textarea"],
    ["highlights", "Highlights (comma separated)", "list"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["image", "Image", "photo"],
  ],
  services: [
    ["label", "Name", "text"], ["key", "Key", "text"], ["icon", "Icon", "text"],
    ["blurb", "Description", "textarea"],
    ["fullDescription", "Full description", "textarea"],
    ["included", "Included (comma separated)", "list"],
    ["requirements", "What you'll need (comma separated)", "list"],
  ],
  mice: [
    ["name", "Section name", "text"], ["key", "Key", "text"],
    ["blurb", "Description", "textarea"],
    ["items", "Services in this section (comma separated)", "list"],
    ["fullDescription", "Full description", "textarea"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["icon", "Icon key", "text"],
    ["image", "Image", "photo"],
  ],
  visa: [
    ["name", "Name", "text"], ["key", "Key", "text"], ["country", "Country", "text"],
    ["category", "Visa category (E-Visa / Sticker Visa)", "text"],
    ["visaType", "Entry type (Single / Multiple)", "text"],
    ["processing", "Processing time", "text"], ["validity", "Validity", "text"],
    // Selling price only. The vendor cost from the rate sheet is never stored
    // here and never reaches the browser.
    //
    // Express is optional: fill it in only for visas the rate sheet quotes at
    // two turnarounds, and the panel shows "Normal" and "Express" side by side.
    // Leave it empty and the visa keeps a single unlabelled "Price" row.
    ["price", "Normal selling price (AED)", "number"],
    ["expressPrice", "Express selling price (AED) — optional", "number"],
    ["currency", "Currency", "text"], ["priceUnit", "Price unit", "text"],
    ["blurb", "Description", "textarea"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["fullDescription", "Full description", "textarea"],
    ["image", "Image", "photo"],
  ],
};
FIELDS.packages = FIELDS.activities;

const TITLE_KEY = { activities: "title", packages: "title", destinations: "name",
  services: "label", visa: "name", mice: "name", homePills: "label" };

/** A blank record with every field the collection expects. */
function blankItem(collection) {
  const item = {};
  FIELDS[collection].forEach(([key, , type]) => {
    item[key] = type === "number" ? 0 : type === "list" ? []
      : type === "toggle" ? false : "";
  });
  if (collection === "activities") item.kind = "activity";
  if (collection === "packages") item.kind = "package";
  return item;
}

/* ------------------------------------------------------------------- state */

let active = "activities";
let draft = null;

const el = (id) => document.querySelector(id);
const norm = (v) => String(v ?? "").trim().toLowerCase();
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/* -------------------------------------------------------------- rendering */

/* Tabs were labelled with the raw collection key, which is fine for "visa" and
   unhelpful for the rest: "packages" is where the homepage carousel is edited
   and "homePills" is not a phrase anybody would go looking for. */
const TAB_LABEL = {
  visa: "Visa",
  packages: "Packages",
  activities: "Activities",
  destinations: "Destinations",
  services: "Services",
  mice: "MICE",
  homePills: "Homepage",
};

/* Collections with no tab of their own. copy has its own editor at the end of
   the strip; homeCards is edited inside the Homepage panel, and a second tab
   for it would be two doors onto one thing. */
const HIDDEN_TABS = new Set(["copy", "homeCards"]);

function renderTabs() {
  el("#admin-tabs").innerHTML = COLLECTIONS.filter((c) => !HIDDEN_TABS.has(c))
    .map((c) => `<button class="admin-tab" type="button" data-tab="${c}"
        data-active="${c === active}">${TAB_LABEL[c] ?? c}${isCustomised(c) ? " •" : ""}</button>`)
    .join("") +
    `<button class="admin-tab" type="button" data-tab="copy"
        data-active="${active === "copy"}">page copy${isCustomised("copy") ? " •" : ""}</button>`;
}

function renderList() {
  if (active === "copy") return renderCopyEditor();
  if (active === "homePills") return renderHomepageEditor();
  const items = getCollection(active);
  const titleKey = TITLE_KEY[active];
  el("#admin-list").innerHTML = items
    .map((item, i) => `
      <li class="admin-row">
        <span class="admin-row-name">${esc(item[titleKey])}</span>
        <span class="admin-row-meta">${esc(item.region || item.country || item.key || "")}</span>
        <button class="admin-btn" type="button" data-edit="${i}">Edit</button>
        <button class="admin-btn admin-btn-danger" type="button" data-remove="${i}">Remove</button>
      </li>`)
    .join("") || `<li class="admin-empty">Nothing here yet — add the first one.</li>`;
  el("#admin-count").textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
}

/**
 * Everything the homepage shows, in the place people look for it.
 *
 * The buttons under the headline live in their own collection; the carousel
 * cards do not, and cannot — they are packages, the same records the Packages
 * page renders, and a card's title and price have to be edited in one place or
 * the two pages disagree.
 *
 * So this panel edits the one thing that genuinely belongs to the homepage —
 * which packages appear on it — and hands off to the Packages editor for the
 * content of a card, rather than pretending there is a separate homepage copy
 * of a package that there is not.
 */
function renderHomepageEditor() {
  const pills = getCollection("homePills");
  const cards = getCollection("homeCards");

  const pillRows = pills.map((pill, i) => `
    <li class="admin-row">
      <span class="admin-row-name">${esc(pill.label)}</span>
      <span class="admin-row-meta">${esc(pill.query || pill.page || "")}</span>
      <button class="admin-btn" type="button" data-edit="${i}">Edit</button>
      <button class="admin-btn admin-btn-danger" type="button" data-remove="${i}">Remove</button>
    </li>`).join("") ||
    `<li class="admin-empty">No buttons yet — “Add new” makes one.</li>`;

  const cardRows = cards.map((ref, i) => {
    const list = getCollection(ref.collection) ?? [];
    const key = CARD_TITLE_KEY[ref.collection] ?? "title";
    const found = list.some((r) => norm(r[key]) === norm(ref.name));
    return `
    <li class="admin-row admin-row-pick">
      <span class="admin-card-order">${i + 1}</span>
      <span class="admin-pick">
        <span class="admin-row-name">${esc(ref.name)}</span>
        <span class="admin-row-meta">${esc(TAB_LABEL[ref.collection] ?? ref.collection)}${
          found ? "" : " · not found, will be skipped"}</span>
      </span>
      <span class="admin-card-actions">
        <button class="admin-btn" type="button" data-card-move="${i}" data-dir="-1"
                ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
        <button class="admin-btn" type="button" data-card-move="${i}" data-dir="1"
                ${i === cards.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
        <button class="admin-btn admin-btn-danger" type="button" data-card-remove="${i}">Remove</button>
      </span>
    </li>`;
  }).join("") ||
    `<li class="admin-empty">No cards chosen — the homepage falls back to its packages.</li>`;

  // Anything not already on the row, grouped so a long visa list stays findable.
  const options = ["visa", "packages", "activities", "destinations"].map((collection) => {
    const key = CARD_TITLE_KEY[collection] ?? "title";
    const items = (getCollection(collection) ?? [])
      .map((r) => r[key])
      .filter((name) => name && !cards.some((c) =>
        c.collection === collection && norm(c.name) === norm(name)));
    return items.length
      ? `<optgroup label="${esc(TAB_LABEL[collection] ?? collection)}">${
          items.map((name) =>
            `<option value="${esc(collection)}::${esc(name)}">${esc(name)}</option>`).join("")
        }</optgroup>`
      : "";
  }).join("");

  el("#admin-list").innerHTML = `
    <li class="admin-section-head"><h3>Buttons under the headline</h3>
      <p>“Add new” above adds another. A button opens the record its query
         names, so a button called Schengen Visa lands on that visa’s panel.</p></li>
    ${pillRows}
    <li class="admin-section-head"><h3>Cards in the homepage carousel</h3>
      <p>In the order shown. A card is a reference to the real record, so its
         title, photograph and price stay whatever that record says — edit those
         in ${esc(TAB_LABEL.visa)} or ${esc(TAB_LABEL.packages)} and the card
         follows.</p></li>
    ${cardRows}
    <li class="admin-row admin-row-add">
      <select id="card-add-pick" aria-label="Record to add to the homepage">
        <option value="">Add a card…</option>${options}
      </select>
      <button class="admin-btn admin-btn-primary" type="button" data-card-add>Add</button>
    </li>`;

  el("#admin-count").textContent =
    `${pills.length} button${pills.length === 1 ? "" : "s"} · ` +
    `${cards.length} card${cards.length === 1 ? "" : "s"}`;
}

function renderCopyEditor() {
  const copy = getCollection("copy");
  el("#admin-list").innerHTML = Object.entries(copy)
    .map(([page, value]) => `
      <li class="admin-row admin-row-copy">
        <strong>${esc(page)}</strong>
        <label>Title<input data-copy="${esc(page)}.title" value="${esc(value.title)}" /></label>
        <label>Intro<textarea data-copy="${esc(page)}.intro" rows="2">${esc(value.intro)}</textarea></label>
      </li>`)
    .join("");
  el("#admin-count").textContent = `${Object.keys(copy).length} pages`;
}

function openEditor(index) {
  const items = getCollection(active);
  draft = index === null ? blankItem(active) : items[index];
  draft.__index = index;

  el("#editor-title").textContent =
    index === null ? `New ${active.replace(/s$/, "")}` : `Edit ${draft[TITLE_KEY[active]]}`;

  el("#editor-fields").innerHTML = FIELDS[active]
    .map(([key, label, type]) => {
      const value = type === "list" ? (draft[key] || []).join(", ") : draft[key] ?? "";
      if (type === "photo")
        // The query is a separate input on purpose, and editable. photoQuery
        // guesses the place from the product name and is usually right, but
        // "Schengen" is not somewhere you can photograph — being able to type
        // "Prague old town" beats any amount of cleverness in the guesser.
        return `<div class="admin-field admin-field-photo">
          <label>${esc(label)}
            <input data-field="${key}" type="text" value="${esc(value)}"
                   placeholder="Paste a URL, or search below" /></label>
          <div class="photo-search">
            <input data-photo-query type="search"
                   value="${esc(photoQuery(draft[TITLE_KEY[active]] ?? "", active))}"
                   placeholder="Search photos" aria-label="Photo search" />
            <button class="admin-btn" type="button" data-photo-find>Find photos</button>
          </div>
          <p class="photo-status" data-photo-status role="status"></p>
          <div class="photo-results" data-photo-results></div>
          ${value ? `<img class="photo-preview" src="${esc(value)}" alt="" />` : ""}
        </div>`;
      if (type === "toggle")
        // Checkbox rather than a yes/no text box: a free-text boolean invites
        // "y", "TRUE" and "1" and then something has to guess what they meant.
        return `<label class="admin-field admin-field-toggle">
          <input data-field="${key}" type="checkbox"${draft[key] ? " checked" : ""} />
          <span>${esc(label)}</span></label>`;
      if (type === "textarea")
        return `<label class="admin-field">${esc(label)}
          <textarea data-field="${key}" rows="3">${esc(value)}</textarea></label>`;
      return `<label class="admin-field">${esc(label)}
        <input data-field="${key}" type="${type === "number" ? "number" : "text"}"
               step="any" value="${esc(value)}" /></label>`;
    })
    .join("");

  el("#admin-editor").showModal();
}

/* ------------------------------------------------------------ photo picker */

/**
 * Finds photographs for the record being edited and shows them as thumbnails.
 *
 * Delegated from the editor rather than bound per field, because the editor
 * rebuilds its fields every time a record is opened.
 */
async function findPhotos(scope) {
  const queryInput = scope.querySelector("[data-photo-query]");
  const status = scope.querySelector("[data-photo-status]");
  const results = scope.querySelector("[data-photo-results]");
  const query = queryInput.value.trim();
  if (!query) { status.textContent = "Type something to search for."; return; }

  status.textContent = "Searching…";
  results.innerHTML = "";
  try {
    const res = await fetch(
      `/api/stock-image?q=${encodeURIComponent(query)}&count=6`
    );
    if (!res.ok) throw new Error(`search returned ${res.status}`);
    const { options = [], reason } = await res.json();

    if (!options.length) {
      // Say which of the two it is. "No photos" when the key is missing sends
      // somebody hunting for a better search term for a problem that is not
      // theirs to solve.
      status.textContent = reason
        ? `No photos — ${reason}`
        : `No photos found for "${query}". Try a place name.`;
      return;
    }
    status.textContent = `${options.length} found — click one to use it.`;
    results.innerHTML = options.map((o) => `
      <button class="photo-option" type="button" data-photo-pick="${esc(o.url)}"
              title="${esc(o.alt || o.photographer)}">
        <img src="${esc(o.thumb || o.url)}" alt="${esc(o.alt)}" loading="lazy" />
        ${o.photographer ? `<span>${esc(o.photographer)}</span>` : ""}
      </button>`).join("");
  } catch (error) {
    // The function only exists on Netlify, so this is the normal answer when
    // the admin is opened from a local server. Worth saying plainly.
    status.textContent =
      `Photo search is unavailable here (${error.message}). It runs on the deployed site.`;
  }
}

function choosePhoto(scope, url) {
  const field = scope.querySelector("[data-field]");
  field.value = url;
  scope.querySelectorAll("[data-photo-pick]").forEach((b) =>
    b.toggleAttribute("data-chosen", b.dataset.photoPick === url));
  let preview = scope.querySelector(".photo-preview");
  if (!preview) {
    preview = document.createElement("img");
    preview.className = "photo-preview";
    preview.alt = "";
    scope.append(preview);
  }
  preview.src = url;
}

document.addEventListener("click", (event) => {
  const find = event.target.closest("[data-photo-find]");
  if (find) { findPhotos(find.closest(".admin-field-photo")); return; }
  const pick = event.target.closest("[data-photo-pick]");
  if (pick) choosePhoto(pick.closest(".admin-field-photo"), pick.dataset.photoPick);
});

/* Enter in the search box searches rather than submitting the editor. */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const box = event.target.closest("[data-photo-query]");
  if (!box) return;
  event.preventDefault();
  findPhotos(box.closest(".admin-field-photo"));
});

function saveEditor() {
  const items = getCollection(active);
  const next = { ...draft };
  delete next.__index;

  /*
   * A blank box means the record has no such value, not that it has zero or an
   * empty string.
   *
   * This mattered the moment content restored from a backup came back without
   * every field: the editor renders a box for each field it knows about, so a
   * package with no rating showed an empty Rating box, and simply opening that
   * package and pressing Save wrote rating: 0 — putting "0.0 ★" on a card
   * nobody had touched. Same for the blank slug, which is derived from the
   * title precisely when it is absent, and would have been pinned to "".
   *
   * A toggle is the exception: false is a real answer, not a missing one.
   */
  el("#editor-fields").querySelectorAll("[data-field]").forEach((input) => {
    const key = input.dataset.field;
    const type = FIELDS[active].find(([k]) => k === key)[2];

    if (type === "toggle") { next[key] = input.checked; return; }

    const raw = input.value.trim();
    if (!raw) { delete next[key]; return; }

    if (type === "number") next[key] = Number(raw) || 0;
    else if (type === "list")
      next[key] = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else next[key] = type === "photo" ? raw : input.value;
  });

  if (!next[TITLE_KEY[active]]) {
    el("#editor-error").textContent = "A name is required.";
    return;
  }
  el("#editor-error").textContent = "";

  if (draft.__index === null) items.push(next);
  else items[draft.__index] = next;

  saveCollection(active, items);
  el("#admin-editor").close();
  refresh();
  toast(draft.__index === null ? "Added" : "Saved");
}

function refresh() { renderTabs(); renderList(); }

let toastTimer = 0;
function toast(message) {
  const node = el("#admin-toast");
  node.textContent = message;
  node.dataset.shown = "true";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.dataset.shown = "false"; }, 2200);
}

/* ------------------------------------------------------------------ events */

el("#admin-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (!tab) return;
  active = tab.dataset.tab;
  el("#admin-add").hidden = active === "copy";
  refresh();
});

el("#admin-list").addEventListener("click", (event) => {
  /* The homepage row is an ordered list of references, so it is edited by
     moving and removing entries rather than by ticking records. Saving the
     list is what the carousel watches. */
  const saveCards = (next, message) => {
    saveCollection("homeCards", next);
    refresh();
    toast(message);
  };

  const move = event.target.closest("[data-card-move]");
  if (move) {
    const from = Number(move.dataset.cardMove);
    const to = from + Number(move.dataset.dir);
    const cards = getCollection("homeCards").map((c) => ({ ...c }));
    if (to < 0 || to >= cards.length) return;
    [cards[from], cards[to]] = [cards[to], cards[from]];
    return saveCards(cards, "Reordered");
  }

  const removeCard = event.target.closest("[data-card-remove]");
  if (removeCard) {
    const cards = getCollection("homeCards").map((c) => ({ ...c }));
    const [gone] = cards.splice(Number(removeCard.dataset.cardRemove), 1);
    return saveCards(cards, `Removed ${gone?.name ?? "card"}`);
  }

  if (event.target.closest("[data-card-add]")) {
    const pick = el("#card-add-pick");
    if (!pick.value) return;
    // "::" rather than a comma, because titles contain commas.
    const [collection, ...rest] = pick.value.split("::");
    const cards = getCollection("homeCards").map((c) => ({ ...c }));
    cards.push({ collection, name: rest.join("::") });
    return saveCards(cards, "Added to the homepage");
  }
  const edit = event.target.closest("[data-edit]");
  if (edit) return openEditor(Number(edit.dataset.edit));
  const remove = event.target.closest("[data-remove]");
  if (!remove) return;
  const items = getCollection(active);
  const name = items[Number(remove.dataset.remove)][TITLE_KEY[active]];
  if (!confirm(`Remove “${name}”? This affects the live site immediately.`)) return;
  items.splice(Number(remove.dataset.remove), 1);
  saveCollection(active, items);
  refresh();
  toast("Removed");
});

el("#admin-list").addEventListener("change", (event) => {
  const field = event.target.closest("[data-copy]");
  if (!field) return;
  const [page, key] = field.dataset.copy.split(".");
  const copy = getCollection("copy");
  copy[page][key] = field.value;
  saveCollection("copy", copy);
  toast("Copy saved");
});

el("#admin-add").addEventListener("click", () => openEditor(null));
el("#editor-save").addEventListener("click", saveEditor);
el("#editor-cancel").addEventListener("click", () => el("#admin-editor").close());

el("#admin-reset").addEventListener("click", () => {
  if (!confirm(`Restore the shipped ${active} content? Your edits to it are lost.`)) return;
  resetCollection(active);
  refresh();
  toast("Restored");
});

el("#admin-reset-all").addEventListener("click", () => {
  if (!confirm("Restore EVERY collection to the shipped content? All edits are lost.")) return;
  resetAll();
  refresh();
  toast("Everything restored");
});

el("#admin-export").addEventListener("click", () => {
  const blob = new Blob([exportAll()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `bgs-content-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

el("#admin-import").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    importAll(await file.text());
    refresh();
    toast("Imported");
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
  event.target.value = "";
});

/* ------------------------------------------------------------------- login */

/* Firebase on: real accounts, and the email field appears. Firebase off: the
   local password, exactly as before. */
if (isCloudEnabled()) {
  el("#login-email-field").hidden = false;
  el("#login-email").required = true;
  el("#login-hint").textContent =
    "Sign in with your Firebase admin account to manage site content.";
}

el("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = el("#login-password").value;

  if (isCloudEnabled()) {
    try {
      await signIn(el("#login-email").value.trim(), value);
    } catch (error) {
      // Firebase codes are precise but unreadable; the cause is nearly always
      // one of two things and neither is worth a stack trace.
      el("#login-error").textContent =
        /user-not-found|wrong-password|invalid-credential|invalid-email/.test(error.code || "")
          ? "That email and password do not match an admin account."
          : `Could not sign in: ${error.message}`;
      return;
    }
  } else if (!(await checkPassword(value))) {
    el("#login-error").textContent = "Wrong password.";
    return;
  }

  el("#login-error").textContent = "";
  el("#admin-login").hidden = true;
  el("#admin-app").hidden = false;
  el("#default-password-warning").hidden = !(await isDefaultPassword());
  refresh();
});

if (isCloudEnabled()) {
  const card = el("#password-form")?.closest("section, .admin-card") || el("#password-form");
  if (card) card.hidden = true;
}

el("#password-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const next = el("#new-password").value;
  const confirmValue = el("#confirm-password").value;
  const status = el("#password-status");
  if (next.length < 6) { status.textContent = "Use at least 6 characters."; return; }
  if (next !== confirmValue) { status.textContent = "The two entries do not match."; return; }
  await changePassword(next);
  status.textContent = "Password changed.";
  el("#new-password").value = "";
  el("#confirm-password").value = "";
  el("#default-password-warning").hidden = true;
});

el("#admin-logout").addEventListener("click", () => location.reload());

/* ===========================================================================
   Update from a spreadsheet
   ---------------------------------------------------------------------------
   Parsing and applying are deliberately separate. A workbook arrives, we work
   out what it would do, and nothing is written until someone has looked at the
   summary and chosen Merge or Replace — because Replace on a short sheet is
   how a catalogue gets deleted by accident.
   =========================================================================== */

let sheetPlans = null;

const sheetStatus = (message) => { el("#sheet-status").textContent = message; };

const countLine = (plan) =>
  [`${plan.added.length} new`, `${plan.updated.length} updated`,
   `${plan.unchanged.length} unchanged`,
   `${plan.missing.length} on the site but not in the sheet`].join(" · ");

function renderSheetPreview(plans, problems, ignoredCost) {
  el("#sheet-dialog-body").innerHTML = `
    ${ignoredCost.length ? `<p class="sheet-note sheet-note-good">
      Ignored cost columns: ${ignoredCost.map(esc).join(", ")}. These are never stored.
    </p>` : ""}
    ${problems.length ? `<details class="sheet-problems">
      <summary>${problems.length} thing${problems.length === 1 ? "" : "s"} to look at</summary>
      <ul>${problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    </details>` : ""}
    ${plans.map((plan) => `
      <section class="sheet-plan">
        <h3>${esc(plan.label)} <span>${esc(countLine(plan))}</span></h3>
        ${plan.added.length ? `<p class="sheet-plan-list"><strong>New:</strong>
          ${plan.added.map((r) => esc(r[plan.identity])).join(", ")}</p>` : ""}
        ${plan.updated.length ? `<p class="sheet-plan-list"><strong>Updated:</strong>
          ${plan.updated.map((u) => esc(u.after[plan.identity])).join(", ")}</p>` : ""}
        ${plan.missing.length ? `<p class="sheet-plan-list sheet-plan-warn">
          <strong>Replace would delete:</strong>
          ${plan.missing.map((r) => esc(r[plan.identity])).join(", ")}</p>` : ""}
      </section>`).join("")}
    <p class="sheet-note">
      <strong>Merge</strong> updates what matches and adds what is new, leaving
      everything else alone. <strong>Replace</strong> makes each section exactly
      what its tab says, deleting the rest.
    </p>`;
  el("#sheet-dialog").showModal();
}

/** New records have no photograph; ask the site's own function for one. */
async function backfillImages(records, collection, identity) {
  const needing = records.filter((r) => !r.image);
  if (!needing.length) return 0;
  let filled = 0;
  for (const record of needing) {
    try {
      const query = `${record[identity]} ${collection === "visa" ? "landmark" : ""}`.trim();
      const res = await fetch(`/api/stock-image?q=${encodeURIComponent(query)}`);
      if (!res.ok) continue;
      const { url } = await res.json();
      if (url) { record.image = url; filled++; }
    } catch { /* a missing photo must not fail the import */ }
  }
  return filled;
}

async function applySheet(mode) {
  const { applyMode } = await import("./sheet-import.mjs?v=130");
  el("#sheet-dialog").close();
  sheetStatus("Applying…");

  let changed = 0, photos = 0;
  for (const plan of sheetPlans) {
    const items = applyMode(plan, mode);
    const fresh = items.filter((i) => !i.image);
    photos += await backfillImages(fresh, plan.collection, plan.identity);
    saveCollection(plan.collection, items);
    changed++;
  }
  sheetPlans = null;
  refresh();
  sheetStatus(`${mode === "merge" ? "Merged" : "Replaced"} ${changed} section${
    changed === 1 ? "" : "s"}.${photos ? ` ${photos} photo${photos === 1 ? "" : "s"} found.` : ""}`);
  toast("Spreadsheet applied");
}

async function handleSheet(file) {
  if (!file) return;
  sheetStatus(`Reading ${file.name}…`);
  try {
    const { parseWorkbook, reconcile } = await import("./sheet-import.mjs?v=130");
    const { tabs, problems, ignoredCostColumns } = await parseWorkbook(file);
    if (!tabs.length) {
      sheetStatus(`Nothing to import. ${problems.join(" ")}`);
      return;
    }
    sheetPlans = reconcile(tabs, (name) => getCollection(name));
    renderSheetPreview(sheetPlans, problems, ignoredCostColumns);
    sheetStatus(`${file.name} read — review the changes.`);
  } catch (error) {
    sheetStatus(`Could not read that file: ${error.message}`);
  }
}

/* --- wiring --- */

const drop = el("#sheet-drop");
el("#sheet-file").addEventListener("change", (event) => {
  handleSheet(event.target.files[0]);
  event.target.value = "";
});
["dragenter", "dragover"].forEach((type) =>
  drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.dataset.over = "true";
  })
);
["dragleave", "drop"].forEach((type) =>
  drop.addEventListener(type, () => { drop.dataset.over = "false"; })
);
drop.addEventListener("drop", (event) => {
  event.preventDefault();
  handleSheet(event.dataTransfer?.files?.[0]);
});

el("#sheet-dialog").addEventListener("click", (event) => {
  if (event.target.closest("[data-sheet-cancel]") || event.target === el("#sheet-dialog")) {
    el("#sheet-dialog").close();
    sheetPlans = null;
    sheetStatus("Cancelled — nothing was changed.");
  }
});
el("#sheet-apply-merge").addEventListener("click", () => applySheet("merge"));
el("#sheet-apply-replace").addEventListener("click", () => applySheet("replace"));

/* --- export, which doubles as the template --- */

el("#sheet-export").addEventListener("click", async () => {
  sheetStatus("Building workbook…");
  try {
    const { exportWorkbook } = await import("./sheet-import.mjs?v=130");
    const blob = await exportWorkbook((name) => getCollection(name));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bgs-catalogue-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    sheetStatus("Exported. Edit it and drop it back to update the site.");
  } catch (error) {
    sheetStatus(`Export failed: ${error.message}`);
  }
});

/* CSV covers the case the workbook does not: one section, opened in anything.
   It exports the tab you are looking at, because "which section" is a question
   the UI can already answer without asking. */
el("#sheet-export-csv").addEventListener("click", async () => {
  if (active === "copy") {
    sheetStatus("Page copy has no spreadsheet form — pick a content tab.");
    return;
  }
  sheetStatus("Building CSV…");
  try {
    const { exportCsv } = await import("./sheet-import.mjs?v=130");
    const blob = await exportCsv(active, (name) => getCollection(name));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bgs-${active}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    sheetStatus(`Exported ${active} as CSV.`);
  } catch (error) {
    sheetStatus(`CSV export failed: ${error.message}`);
  }
});

/* A blank template, for a list typed from scratch rather than edited. */
el("#sheet-template").addEventListener("click", async () => {
  sheetStatus("Building template…");
  try {
    const { exportTemplate } = await import("./sheet-import.mjs?v=130");
    const blob = await exportTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bgs-content-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    sheetStatus("Template downloaded. Read me tab explains the columns.");
  } catch (error) {
    sheetStatus(`Template failed: ${error.message}`);
  }
});
