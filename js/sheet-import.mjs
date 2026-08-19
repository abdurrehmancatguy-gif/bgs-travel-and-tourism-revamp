import { SHEETS, PRESERVED, COST_HEADER, collectionForTab, fieldForHeader } from "./sheet-schema.mjs?v=99";

/**
 * Reads a workbook and works out what it would change — without changing
 * anything. Parsing and applying are separate on purpose: the admin shows the
 * result first, because "replace" on a short sheet is how a catalogue gets
 * deleted by accident.
 *
 * SheetJS is a megabyte, so it loads from the CDN only when someone actually
 * drops a file, and only on the admin page.
 */

const SHEETJS = "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

let xlsxPromise = null;
const loadXlsx = () => (xlsxPromise ??= import(SHEETJS));

/** Names match ignoring case, spacing and punctuation — "UAE & Dubai" == "uae and dubai". */
const key = (s) => String(s ?? "").toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

function coerce(value, type) {
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "" || raw === null || raw === undefined) return undefined;
  if (type === "number") {
    // Stripping the non-digits out of "call us" leaves "", and Number("") is 0,
    // not NaN — so a price nobody typed would have silently become free.
    const digits = String(raw).replace(/[^\d.-]/g, "");
    if (!/\d/.test(digits)) return NaN;
    const n = Number(digits);
    return Number.isFinite(n) ? n : NaN;
  }
  if (type === "list") {
    // Newlines win when the cell has them: document lists contain commas
    // — "Ejari Copy, if Available" is one requirement, not two — and
    // splitting on commas as well turned a clean round-trip into 15 false
    // edits. Semicolons and commas are only used for single-line cells.
    const text = String(raw);
    const separator = /\r?\n/.test(text) ? /\r?\n/ : /;|,/;
    return text.split(separator)
      .map((s) => s.replace(/^[\s*•\-]+/, "").trim())
      .filter(Boolean);
  }
  return String(raw).trim();
}

/* ------------------------------------------------------------------- parse */

/**
 * @returns {{ tabs: Array, problems: string[], ignoredCostColumns: string[] }}
 */
export async function parseWorkbook(file) {
  const { read, utils } = await loadXlsx();
  const book = read(await file.arrayBuffer(), { cellDates: false });

  const tabs = [];
  const problems = [];
  const ignoredCostColumns = [];

  for (const sheetName of book.SheetNames) {
    const collection = collectionForTab(sheetName);
    if (!collection) {
      problems.push(`Tab "${sheetName}" does not match a section and was skipped.`);
      continue;
    }
    const spec = SHEETS[collection];
    const rows = utils.sheet_to_json(book.Sheets[sheetName], { defval: "", raw: false });
    if (!rows.length) {
      problems.push(`Tab "${sheetName}" has no rows.`);
      continue;
    }

    // Report unrecognised headers once per tab rather than once per row.
    for (const header of Object.keys(rows[0])) {
      if (COST_HEADER.test(header)) { ignoredCostColumns.push(`${sheetName}: ${header}`); continue; }
      if (!fieldForHeader(header, collection)) {
        problems.push(`Tab "${sheetName}": column "${header}" is not recognised and was ignored.`);
      }
    }

    const records = [];
    rows.forEach((row, i) => {
      const line = i + 2; // header is row 1
      const rec = {};
      for (const [header, value] of Object.entries(row)) {
        const col = fieldForHeader(header, collection);
        if (!col) continue;
        const out = coerce(value, col.type);
        if (out === undefined) continue;
        if (typeof out === "number" && Number.isNaN(out)) {
          problems.push(`${spec.tab} row ${line}: "${header}" is not a number, left unset.`);
          continue;
        }
        rec[col.field] = out;
      }
      if (!rec[spec.identity]) {
        problems.push(`${spec.tab} row ${line}: no ${spec.identity}, row skipped.`);
        return;
      }
      records.push(spec.normalise ? spec.normalise(rec) : rec);
    });

    if (records.length) tabs.push({ collection, sheetName, records });
  }

  if (!tabs.length && !problems.length) problems.push("The file has no readable sheets.");
  return { tabs, problems, ignoredCostColumns };
}

/* --------------------------------------------------------------- reconcile */

/**
 * Compares parsed rows against what is on the site. Returns both outcomes so
 * the admin can show what merge and replace would each do before either runs.
 */
export function reconcile(tabs, currentFor) {
  return tabs.map(({ collection, sheetName, records }) => {
    const spec = SHEETS[collection];
    const current = currentFor(collection) ?? [];
    const byKey = new Map(current.map((item) => [key(item[spec.identity]), item]));

    const added = [], updated = [], unchanged = [];
    const seen = new Set();

    for (const rec of records) {
      const k = key(rec[spec.identity]);
      seen.add(k);
      const existing = byKey.get(k);
      if (!existing) { added.push(rec); continue; }
      const merged = mergeRecord(existing, rec);
      (JSON.stringify(merged) === JSON.stringify(existing) ? unchanged : updated)
        .push({ before: existing, after: merged });
    }

    const missing = current.filter((item) => !seen.has(key(item[spec.identity])));
    return { collection, sheetName, label: spec.label, identity: spec.identity,
             added, updated, unchanged, missing, records, current };
  });
}

/**
 * A sheet only carries what a sheet can carry. Everything else on the record —
 * the photograph above all — survives untouched.
 */
function mergeRecord(existing, incoming) {
  const out = { ...existing, ...incoming };
  for (const field of PRESERVED) {
    if (existing[field] !== undefined) out[field] = existing[field];
  }
  return out;
}

/** The final list for a collection under the chosen mode. */
export function applyMode(plan, mode) {
  const spec = SHEETS[plan.collection];
  if (mode === "replace") {
    // Even replacing, a record whose name matches keeps its image and ids.
    const byKey = new Map(
      [...plan.updated.map((u) => u.before), ...plan.unchanged.map((u) => u.before),
       ...plan.missing].map((item) => [key(item[spec.identity]), item])
    );
    return plan.records.map((rec) => {
      const existing = byKey.get(key(rec[spec.identity]));
      return existing ? mergeRecord(existing, rec) : rec;
    });
  }
  // Merge: walk the list already on the site so its order survives, swapping in
  // the updated version of anything the sheet touched, then append what is new.
  const updatedByKey = new Map(plan.updated.map((u) => [key(u.after[spec.identity]), u.after]));
  const ordered = plan.current.map(
    (item) => updatedByKey.get(key(item[spec.identity])) ?? item
  );
  const seen = new Set(ordered.map((i) => key(i[spec.identity])));
  return [...ordered, ...plan.added.filter((r) => !seen.has(key(r[spec.identity])))];
}

export { key as identityKey };

/* ------------------------------------------------------------------ export */

/**
 * The current catalogue as a workbook, one tab per collection, with exactly the
 * columns this importer reads back. It is the template as well as the backup:
 * export what is live, edit it, drop it in. A blank template nobody knows how
 * to fill is worse than no template at all.
 *
 * Cost columns are not written because they are not stored, and `image`, `icon`
 * and the ids are left out because a sheet cannot set them — showing a column
 * whose edits are silently discarded would be a lie.
 */
export async function exportWorkbook(currentFor) {
  const { utils, write } = await loadXlsx();
  const book = utils.book_new();

  for (const [collection, spec] of Object.entries(SHEETS)) {
    const items = currentFor(collection) ?? [];
    const headers = spec.columns.map((c) => c.field);
    const rows = items.map((item) =>
      Object.fromEntries(spec.columns.map((col) => {
        const value = item[col.field];
        return [col.field, Array.isArray(value) ? value.join("\n") : value ?? ""];
      }))
    );
    const sheet = utils.json_to_sheet(rows.length ? rows : [
      Object.fromEntries(headers.map((h) => [h, ""])),
    ], { header: headers });
    // Wide enough to read without dragging every column open.
    sheet["!cols"] = headers.map((h) => ({ wch: /description|requirements|items|highlights|included/.test(h) ? 46 : 18 }));
    utils.book_append_sheet(book, sheet, spec.tab);
  }

  const buffer = write(book, { bookType: "xlsx", type: "array" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
