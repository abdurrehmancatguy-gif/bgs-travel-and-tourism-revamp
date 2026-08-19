import {
  COLLECTIONS, getCollection, saveCollection, resetCollection, resetAll,
  exportAll, importAll, isCustomised, isCloudEnabled,
} from "./store.js?v=114";
import { signIn } from "./cloud.js?v=114";

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
    ["image", "Image URL", "text"], ["icon", "Icon", "text"],
  ],
  destinations: [
    ["name", "Name", "text"], ["key", "Key", "text"], ["region", "Region", "text"],
    ["bestTime", "Best time to go", "text"],
    ["blurb", "Description", "textarea"],
    ["fullDescription", "Full description", "textarea"],
    ["highlights", "Highlights (comma separated)", "list"],
    ["requirements", "What you'll need (comma separated)", "list"],
    ["image", "Image URL", "text"],
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
    ["image", "Image URL", "text"],
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
    ["image", "Image URL", "text"],
  ],
};
FIELDS.packages = FIELDS.activities;

const TITLE_KEY = { activities: "title", packages: "title", destinations: "name", services: "label", visa: "name", mice: "name" };

/** A blank record with every field the collection expects. */
function blankItem(collection) {
  const item = {};
  FIELDS[collection].forEach(([key, , type]) => {
    item[key] = type === "number" ? 0 : type === "list" ? [] : "";
  });
  if (collection === "activities") item.kind = "activity";
  if (collection === "packages") item.kind = "package";
  return item;
}

/* ------------------------------------------------------------------- state */

let active = "activities";
let draft = null;

const el = (id) => document.querySelector(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/* -------------------------------------------------------------- rendering */

function renderTabs() {
  el("#admin-tabs").innerHTML = COLLECTIONS.filter((c) => c !== "copy")
    .map((c) => `<button class="admin-tab" type="button" data-tab="${c}"
        data-active="${c === active}">${c}${isCustomised(c) ? " •" : ""}</button>`)
    .join("") +
    `<button class="admin-tab" type="button" data-tab="copy"
        data-active="${active === "copy"}">page copy${isCustomised("copy") ? " •" : ""}</button>`;
}

function renderList() {
  if (active === "copy") return renderCopyEditor();
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

function saveEditor() {
  const items = getCollection(active);
  const next = { ...draft };
  delete next.__index;

  el("#editor-fields").querySelectorAll("[data-field]").forEach((input) => {
    const key = input.dataset.field;
    const type = FIELDS[active].find(([k]) => k === key)[2];
    if (type === "number") next[key] = Number(input.value) || 0;
    else if (type === "list")
      next[key] = input.value.split(",").map((s) => s.trim()).filter(Boolean);
    else next[key] = input.value;
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
  const { applyMode } = await import("./sheet-import.mjs?v=114");
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
    const { parseWorkbook, reconcile } = await import("./sheet-import.mjs?v=114");
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
    const { exportWorkbook } = await import("./sheet-import.mjs?v=114");
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
    const { exportCsv } = await import("./sheet-import.mjs?v=114");
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
    const { exportTemplate } = await import("./sheet-import.mjs?v=114");
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
