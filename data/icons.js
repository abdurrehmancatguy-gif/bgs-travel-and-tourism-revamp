/**
 * Inline SVG icon set. The project has no icon library and doesn't need one
 * for this many glyphs, so these are hand-rolled 24x24 stroke icons that
 * inherit `currentColor` — the cards paint them in BGS gold.
 */

const svg = (body, { fill = false } = {}) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ` +
  `fill="${fill ? "currentColor" : "none"}" stroke="${fill ? "none" : "currentColor"}" ` +
  `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  /* ---- package categories ---- */
  desert: svg(
    `<circle cx="12" cy="7.5" r="3.2"/>` +
      `<path d="M2 20c2.6 0 3.4-3.4 6-3.4S10.9 20 13.5 20"/>` +
      `<path d="M11 20c1.6 0 2.4-2.4 4.5-2.4S20.4 20 22 20"/>`
  ),
  water: svg(
    `<path d="M3 17.5h18l-2.2 3.2a2 2 0 0 1-1.6.8H6.8a2 2 0 0 1-1.6-.8Z"/>` +
      `<path d="M5.5 17.5V11h13v6.5"/>` +
      `<path d="M12 11V3.5"/><path d="M12 5.5h5l-2 2.2 2 2.2h-5"/>`
  ),
  luxury: svg(
    `<path d="M3 8.5l3.6 2.6L12 4l5.4 7.1L21 8.5l-1.7 9.2a1.4 1.4 0 0 1-1.4 1.1H6.1a1.4 1.4 0 0 1-1.4-1.1Z"/>` +
      `<path d="M4.9 15.4h14.2"/>`
  ),
  cultural: svg(
    `<path d="M4 20V11a8 8 0 0 1 16 0v9"/>` +
      `<path d="M9.5 20v-6a2.5 2.5 0 0 1 5 0v6"/>` +
      `<path d="M2.5 20h19"/><path d="M12 3V1.5"/>`
  ),
  family: svg(
    `<circle cx="8" cy="7" r="2.6"/><circle cx="16.5" cy="8" r="2.1"/>` +
      `<path d="M2.5 20v-1.6A4.4 4.4 0 0 1 6.9 14h2.2a4.4 4.4 0 0 1 4.4 4.4V20"/>` +
      `<path d="M15 14.2h1.9a4.1 4.1 0 0 1 4.1 4.1V20"/>`
  ),
  safari: svg(
    `<circle cx="6.5" cy="15" r="4"/><circle cx="17.5" cy="15" r="4"/>` +
      `<path d="M10.5 14.5h3"/>` +
      `<path d="M5.4 11.2 6.8 4.6a1.2 1.2 0 0 1 1.2-1h1.3a1.2 1.2 0 0 1 1.2 1.2v5"/>` +
      `<path d="M18.6 11.2 17.2 4.6a1.2 1.2 0 0 0-1.2-1h-1.3a1.2 1.2 0 0 0-1.2 1.2v5"/>`
  ),
  beach: svg(
    `<path d="M12 21V10.5"/>` +
      `<path d="M12 10.5C9.6 7.6 6.2 6.9 3.4 8.6 5.4 5.2 9.4 4 12 6"/>` +
      `<path d="M12 10.5c2.4-2.9 5.8-3.6 8.6-1.9C18.6 5.2 14.6 4 12 6"/>` +
      `<path d="M3 21c1.6-1.4 3.2-1.4 4.8 0 1.6-1.4 3.2-1.4 4.8 0 1.6-1.4 3.2-1.4 4.8 0"/>`
  ),
  adventure: svg(
    `<circle cx="12" cy="12" r="9"/>` +
      `<path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5Z"/>`
  ),
  heritage: svg(
    `<path d="M3 20h18"/><path d="M5 20V9.5l7-4.5 7 4.5V20"/>` +
      `<path d="M9.5 20v-4.8a2.5 2.5 0 0 1 5 0V20"/><path d="M5 12.5h14"/>`
  ),

  /* ---- services ---- */
  visa: svg(
    `<rect x="4" y="2.8" width="16" height="18.4" rx="2.2"/>` +
      `<circle cx="12" cy="9.5" r="2.6"/>` +
      `<path d="M8 16.4h8"/><path d="M9.6 19h4.8"/>`
  ),
  flights: svg(`<path d="M21 15.5 13.5 12V5.2a1.7 1.7 0 0 0-3.4 0V12L2.6 15.5v2l7.5-2.2v4.1l-2.2 1.5v1.4l3.9-1 3.9 1v-1.4l-2.2-1.5v-4.1l7.5 2.2Z"/>`),
  hotels: svg(
    `<path d="M2.5 20v-9"/><path d="M21.5 20v-6.5a2.5 2.5 0 0 0-2.5-2.5H2.5"/>` +
      `<path d="M2.5 15.5h19"/><circle cx="7" cy="8" r="2.2"/><path d="M2.5 11V5"/>`
  ),
  transport: svg(
    `<path d="M3 16.5v-4l1.8-4.3A2 2 0 0 1 6.6 7h10.8a2 2 0 0 1 1.8 1.2L21 12.5v4"/>` +
      `<path d="M3 16.5h18"/><path d="M4.2 12.5h15.6"/>` +
      `<circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>`
  ),
  concierge: svg(
    `<path d="M3 17h18"/><path d="M4.8 17a7.2 7.2 0 0 1 14.4 0"/>` +
      `<path d="M12 6.4V5"/><circle cx="12" cy="7.6" r="1.2"/><path d="M2.5 20.5h19"/>`
  ),
  /* ---- MICE ----
     Each section gets its own glyph. They all shared `concierge` before, which
     is a room-service cloche — five cards in a row each stamped with a serving
     dome read as a food menu rather than corporate travel. */
  meetings: svg(
    // Four people round a table, from above.
    `<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="4.7" r="1.9"/>` +
      `<circle cx="12" cy="19.3" r="1.9"/><circle cx="4.7" cy="12" r="1.9"/>` +
      `<circle cx="19.3" cy="12" r="1.9"/>`
  ),
  incentive: svg(
    `<path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 5.6H5.6A2.4 2.4 0 0 0 8 9.6"/>` +
      `<path d="M16 5.6h2.4A2.4 2.4 0 0 1 16 9.6"/><path d="M12 13v3.4"/>` +
      `<path d="M8.8 20h6.4l-.8-3.6H9.6Z"/>`
  ),
  conference: svg(
    `<rect x="9.6" y="2.8" width="4.8" height="9" rx="2.4"/>` +
      `<path d="M6.4 10.6a5.6 5.6 0 0 0 11.2 0"/><path d="M12 16.2V20"/>` +
      `<path d="M8.8 20h6.4"/>`
  ),
  exhibition: svg(
    // A stand: canopy, uprights, counter.
    `<path d="M3 4h18l-1.8 4H4.8Z"/><path d="M5 8v12"/><path d="M19 8v12"/>` +
      `<path d="M5 20h14"/><path d="M9 20v-6h6v6"/>`
  ),
  corporateEvent: svg(
    `<path d="M12 2.8 14 9.2l6.4 2-6.4 2-2 6.4-2-6.4-6.4-2 6.4-2Z"/>`
  ),
  activities: svg(
    `<path d="M3 8.2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z"/>` +
      `<path d="M9.5 6.2v8"/>`
  ),
};

/** Render an icon by key; unknown keys fall back to the compass. */
export const icon = (name) => ICONS[name] || ICONS.adventure;
