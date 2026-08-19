/**
 * The homepage's own editable bits.
 *
 * These were hardcoded in index.html, which meant the three pills under the
 * headline — the most prominent links on the site — were the only content BGS
 * could not change without editing markup. They live here so the store can
 * layer admin edits over them like everything else.
 */

/**
 * The pills beneath the hero copy.
 *
 * `page` is which section to land on. `query` names one record on that page;
 * when it matches, that record's panel opens on arrival rather than the
 * visitor being dropped on a filtered list to find it again. Leave `query`
 * empty to land on the whole section, and leave `page` empty for a
 * tailor-made WhatsApp enquiry.
 *
 * The query has to match the record's title as the catalogue spells it, which
 * is why these read "Saudi Multiple Entry Visa" and not "Saudi Multiple Visa"
 * the way the labels do. The label is what a visitor reads; the query is what
 * the page looks up.
 */
export const HOME_PILLS = [
  { label: "Saudi Multiple Visa", page: "visa", query: "Saudi Multiple Entry Visa" },
  { label: "Schengen Visa", page: "visa", query: "Schengen Visa" },
  { label: "MICE", page: "mice", query: "" },
];
