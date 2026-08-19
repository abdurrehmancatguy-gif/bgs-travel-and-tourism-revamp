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

/**
 * The cards in the homepage carousel, in order.
 *
 * References rather than copies: each entry names a collection and a record, and
 * the carousel looks the live record up when it renders. A card therefore shows
 * the same title, photograph and detail as the record's own page, and editing it
 * in one place changes both — which is the point, because a visa quoted at two
 * prices on two pages is worse than a visa quoted on one.
 *
 * An ordered list rather than a flag on each record, because the row is mixed:
 * a flag can say "show this" but not "show this third, after two visas", and
 * flags live on the records so they cannot order across two collections at all.
 *
 * `name` matches the record's own title field — name for a visa, title for a
 * package. An entry that matches nothing is skipped rather than rendered blank,
 * so renaming a visa quietly drops it from the homepage instead of leaving a
 * card with no words on it.
 */
export const HOME_CARDS = [
  { collection: "visa", name: "Saudi Multiple Entry Visa" },
  { collection: "visa", name: "Schengen Visa" },
  { collection: "visa", name: "China Business Visa" },
  { collection: "packages", name: "Ethiopia Historical Circuit: Lalibela + Addis" },
  { collection: "packages", name: "Bali Discovery: Temples, Rice Terraces + Beaches" },
  { collection: "packages", name: "Rajasthan Royal Heritage Tour" },
];
