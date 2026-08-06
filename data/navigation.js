/**
 * Navigation content and what each item does. Every entry carries an `action`
 * so nothing in the menus is a dead `#` link.
 *
 * Action shapes:
 *   { kind: "filter", filter: {type, value}, label }  filter the carousel, go
 *       to the package scene; falls back to a WhatsApp enquiry when the filter
 *       matches no packages yet (see js/navigation.js).
 *   { kind: "scene", scene }                          scroll to a scene.
 *   { kind: "service", service }                      scroll to Services and
 *       select that service panel.
 *   { kind: "whatsapp", intent }                      open a WhatsApp enquiry.
 */

/** Scroll offsets (px into the pinned cinematic section) for each scene. */
export const SCENES = {
  intro: 0,
  promise: 1180,
  discovery: 2320,
  packages: 3150,
  services: 4200,
};

export const DESTINATION_GROUPS = [
  {
    label: "UAE",
    items: [{ label: "UAE & Dubai", value: "uae-dubai" }],
  },
  {
    label: "Africa",
    items: [
      { label: "Tanzania", value: "tanzania" },
      { label: "South Africa", value: "south-africa" },
      { label: "Ethiopia", value: "ethiopia" },
      { label: "Uganda", value: "uganda" },
      { label: "Zambia", value: "zambia" },
      { label: "Malawi", value: "malawi" },
      { label: "Mozambique", value: "mozambique" },
    ],
  },
  {
    label: "Asia",
    items: [
      { label: "India", value: "india" },
      { label: "Pakistan", value: "pakistan" },
      { label: "Indonesia", value: "indonesia" },
    ],
  },
  {
    label: "Europe & Americas",
    items: [
      { label: "Germany", value: "germany" },
      { label: "United Kingdom", value: "united-kingdom" },
      { label: "Moldova", value: "moldova" },
      { label: "Panama", value: "panama" },
    ],
  },
];

export const SERVICES = [
  {
    key: "visa",
    label: "Visa Services",
    icon: "visa",
    blurb:
      "Tourist, transit and visit visas for the UAE and beyond, prepared and tracked for you.",
  },
  {
    key: "flights",
    label: "Flights",
    icon: "flights",
    blurb:
      "Fares held, routings compared and every connection checked before you book.",
  },
  {
    key: "hotels",
    label: "Hotels & Stays",
    icon: "hotels",
    blurb:
      "City hotels, desert camps, safari lodges and beach resorts, matched to your trip.",
  },
  {
    key: "transport",
    label: "Transport & Fleet",
    icon: "transport",
    blurb:
      "Airport transfers, private drivers and a fleet sized to your group anywhere in the UAE.",
  },
  {
    key: "concierge",
    label: "Concierge",
    icon: "concierge",
    blurb:
      "One team on call through the whole trip, from the first idea to the journey home.",
  },
  {
    key: "activities",
    label: "Activities & Excursions",
    icon: "activities",
    blurb:
      "Desert, water, cultural and family experiences, booked around the rest of your itinerary.",
  },
];

/** The primary menus, centred in the header. */
export const PRIMARY_NAV = [
  {
    id: "destinations",
    label: "Destinations",
    kind: "groups",
    groups: DESTINATION_GROUPS.map((group) => ({
      label: group.label,
      items: group.items.map((item) => ({
        label: item.label,
        action: {
          kind: "filter",
          filter: { type: "destination", value: item.value },
          label: item.label,
        },
      })),
    })),
  },
  {
    id: "packages",
    label: "Packages",
    kind: "list",
    items: [
      { label: "All Packages", action: { kind: "filter", filter: { type: "all" }, label: "All Packages" } },
      { label: "Dubai", action: { kind: "filter", filter: { type: "region", value: "Dubai" }, label: "Dubai" } },
      { label: "Africa", action: { kind: "filter", filter: { type: "region", value: "Africa" }, label: "Africa" } },
      { label: "Asia", action: { kind: "filter", filter: { type: "region", value: "Asia" }, label: "Asia" } },
      { label: "Europe", action: { kind: "filter", filter: { type: "region", value: "Europe" }, label: "Europe" } },
      { label: "Luxury", action: { kind: "filter", filter: { type: "tag", value: "luxury" }, label: "Luxury" } },
      { label: "Family", action: { kind: "filter", filter: { type: "tag", value: "family" }, label: "Family" } },
      { label: "Adventure", action: { kind: "filter", filter: { type: "tag", value: "adventure" }, label: "Adventure" } },
    ],
  },
  {
    id: "activities",
    label: "Activities",
    kind: "list",
    items: [
      { label: "Desert", action: { kind: "filter", filter: { type: "tag", value: "desert" }, label: "Desert" } },
      { label: "Water", action: { kind: "filter", filter: { type: "tag", value: "water" }, label: "Water" } },
      { label: "Sightseeing", action: { kind: "filter", filter: { type: "tag", value: "sightseeing" }, label: "Sightseeing" } },
      { label: "Luxury", action: { kind: "filter", filter: { type: "tag", value: "luxury" }, label: "Luxury" } },
      { label: "Family", action: { kind: "filter", filter: { type: "tag", value: "family" }, label: "Family" } },
      { label: "Adventure", action: { kind: "filter", filter: { type: "tag", value: "adventure" }, label: "Adventure" } },
      { label: "Cultural", action: { kind: "filter", filter: { type: "tag", value: "cultural" }, label: "Cultural" } },
    ],
  },
  {
    id: "services",
    label: "Services",
    kind: "services",
    // Visa has its own header menu and Activities has its own, so neither
    // belongs in this list. Named rather than sliced by position, so reordering
    // SERVICES cannot quietly change which ones appear here.
    items: SERVICES.filter(
      (service) => service.key !== "visa" && service.key !== "activities"
    ).map((service) => ({
      label: service.label,
      icon: service.icon,
      action: { kind: "service", service: service.key },
    })),
  },
  {
    // A category in its own right rather than one row inside Services. It has
    // no sub-items, so it renders as a plain trigger that jumps straight to the
    // visa panel — see the "action" branch in js/navigation.js.
    id: "visa",
    label: "Visa",
    kind: "action",
    action: { kind: "service", service: "visa" },
  },
];

/**
 * About and Contact sit in a compact "More" menu so the four primary items stay
 * centred and the header keeps its minimal weight (see the brief's fallback).
 */
export const UTILITY_NAV = {
  id: "more",
  label: "More",
  kind: "list",
  items: [
    { label: "About", action: { kind: "scene", scene: "promise" } },
    { label: "Contact", action: { kind: "scene", scene: "services" } },
  ],
};

export const ALL_MENUS = [...PRIMARY_NAV, UTILITY_NAV];
