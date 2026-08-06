import { PACKAGE_IMAGES } from "./images.js?v=27";

/**
 * The single source of truth for package content. Frontend-only: nothing here
 * is fetched, persisted or posted anywhere. Enquiries leave via WhatsApp.
 *
 * `price` is a number plus `currency`/`priceUnit` rather than a pre-baked
 * string, so the display label and the WhatsApp message can be derived from
 * one value instead of drifting apart. See formatPrice / priceLabel below.
 *
 * `tags` drive every filter in the navigation (packages, activities and
 * destination menus all resolve down to tags, regions or destination keys).
 */
const CATALOGUE = [
  {
    id: 1,
    slug: "evening-desert-safari",
    kind: "activity",
    title: "Evening Desert Safari with BBQ Dinner",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Adventure / Desert",
    tags: ["adventure", "desert"],
    duration: "Full Day",
    rating: 4.9,
    reviewCount: 142,
    price: 180,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "Thrilling dune bashing, camel rides, belly dancing and a lavish BBQ dinner under the stars in the Arabian desert.",
    fullDescription:
      "The desert changes completely in the late afternoon, and this is the hour we take you into it. You'll ride the dunes in a four-wheel drive, meet the camels, try sandboarding on the slip face, then settle into a traditional camp as the light drops. Dinner is a proper BBQ spread under an open sky, with live entertainment once the stars are out.",
    highlights: [
      "Dune bashing",
      "Camel ride",
      "Sandboarding",
      "Henna",
      "BBQ dinner",
      "Live entertainment",
    ],
    included: [
      "Hotel pickup and drop-off",
      "Desert activities",
      "BBQ dinner",
      "Soft drinks",
      "Live entertainment",
    ],
    image: PACKAGE_IMAGES.desertSafari,
    icon: "desert",
  },
  {
    id: 2,
    slug: "luxury-dhow-cruise-dinner",
    kind: "activity",
    title: "Luxury Dhow Cruise Dinner",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Water Experience",
    tags: ["water", "sightseeing"],
    duration: "Half Day",
    rating: 4.8,
    reviewCount: 98,
    price: 120,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "Cruise along historic Dubai Creek on a traditional wooden dhow with live entertainment, an unlimited buffet and skyline views.",
    fullDescription:
      "Dubai Creek is where the city started trading, and a hand-built wooden dhow is still the best way to read it. You'll board in the evening, take the water slowly past the old quarters and the new towers, and eat an unlimited international buffet on deck while the skyline lights come up around you.",
    highlights: [
      "Traditional dhow",
      "Dubai Creek views",
      "International buffet",
      "Live entertainment",
      "Evening skyline",
    ],
    image: PACKAGE_IMAGES.dhowCruise,
    icon: "water",
  },
  {
    id: 3,
    slug: "private-dubai-city-tour-helicopter",
    kind: "activity",
    title: "Private Dubai City Tour + Helicopter",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Luxury",
    tags: ["luxury", "sightseeing"],
    duration: "Full Day",
    rating: 5.0,
    reviewCount: 21,
    price: 1650,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "A private tour of Dubai's most iconic landmarks followed by a helicopter flight over Palm Jumeirah and Dubai Marina.",
    fullDescription:
      "A full day with a private vehicle, a private guide and no fixed queue to stand in. You'll cover the landmarks that define the city at ground level first, then take the whole thing from the air — the Palm laid out beneath you, the Marina towers, and the coastline running away in both directions.",
    highlights: [
      "Private vehicle",
      "Dubai landmarks",
      "Helicopter flight",
      "Palm Jumeirah aerial view",
      "Dubai Marina aerial view",
    ],
    image: PACKAGE_IMAGES.helicopter,
    icon: "luxury",
  },
  {
    id: 4,
    slug: "dubai-frame-gold-souk-cultural-tour",
    kind: "activity",
    title: "Dubai Frame + Gold Souk Cultural Tour",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Cultural",
    tags: ["cultural", "sightseeing"],
    duration: "Half Day",
    rating: 4.7,
    reviewCount: 56,
    price: 95,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "Walk the glass bridge at Dubai Frame, then explore the Gold and Spice Souks of old Deira with a local guide.",
    fullDescription:
      "Old Dubai on one side of the glass, new Dubai on the other — the Frame is built to make that contrast unmissable, and the glass floor is worth the nerve. Afterwards you cross into Deira with a guide who knows the lanes, for the Gold Souk, the Spice Souk and the trading city the towers grew out of.",
    highlights: [
      "Dubai Frame",
      "Glass bridge",
      "Old and new Dubai views",
      "Gold Souk",
      "Spice Souk",
      "Guided cultural walk",
    ],
    image: PACKAGE_IMAGES.dubaiFrame,
    icon: "cultural",
  },
  {
    id: 5,
    slug: "hot-air-balloon-dubai-desert",
    kind: "activity",
    title: "Hot Air Balloon over Dubai Desert",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Adventure / Luxury",
    tags: ["adventure", "luxury", "desert"],
    duration: "Early Morning",
    rating: 4.9,
    reviewCount: 38,
    price: 795,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "Float above the Dubai desert at dawn and enjoy a celebratory breakfast after landing.",
    fullDescription:
      "An early start, and worth every minute of it. You lift off as the sun comes up and the dunes below turn from grey to gold, with the desert completely silent apart from the burner. It's about an hour in the air, a gentle landing, and breakfast waiting on the sand.",
    highlights: [
      "Sunrise departure",
      "Desert panorama",
      "Hot-air balloon flight",
      "Landing breakfast",
      "Premium morning experience",
    ],
    image: PACKAGE_IMAGES.hotAirBalloon,
    icon: "adventure",
  },
  {
    id: 6,
    slug: "ultimate-dubai-family-day",
    kind: "activity",
    title: "Ultimate Dubai Family Day",
    destination: "Dubai, UAE",
    destinationKey: "uae-dubai",
    region: "Dubai",
    category: "Family",
    tags: ["family", "adventure", "water"],
    duration: "Full Day",
    rating: 4.7,
    reviewCount: 77,
    price: 320,
    currency: "AED",
    priceUnit: "per person",
    shortDescription:
      "Combine theme-park excitement, a family-friendly desert experience and an evening dhow cruise in one Dubai day.",
    fullDescription:
      "Built for families who want one really good day rather than three half-days of logistics. Theme park in the morning while everyone's fresh, a gentler desert afternoon with camels and space to run, then an evening on the water where the kids can eat and the adults can sit down. Transfers between all three are handled.",
    highlights: [
      "Theme park",
      "Camel experience",
      "Desert activities",
      "Dhow cruise",
      "Family entertainment",
    ],
    image: PACKAGE_IMAGES.familyDay,
    icon: "family",
  },
  {
    id: 7,
    slug: "serengeti-safari-zanzibar",
    kind: "package",
    title: "Classic Serengeti Safari + Zanzibar Extension",
    destination: "Tanzania",
    destinationKey: "tanzania",
    region: "Africa",
    category: "Safari / Beach",
    tags: ["safari", "beach", "adventure"],
    duration: "7 Days",
    rating: 5.0,
    reviewCount: 34,
    price: 2490,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Witness the Great Migration and track the Big Five before unwinding on Zanzibar's white-sand beaches.",
    fullDescription:
      "The classic Tanzania pairing, and the reason it endures: several days of game drives across the Serengeti with guides who know where the herds are moving, followed by a short hop to Zanzibar to do absolutely nothing on a white-sand beach. Big Five tracking in the first half, warm Indian Ocean in the second.",
    highlights: [
      "Serengeti game drives",
      "Big Five wildlife",
      "Great Migration experience",
      "Local safari guides",
      "Zanzibar beach extension",
    ],
    image: PACKAGE_IMAGES.serengeti,
    icon: "safari",
  },
  {
    id: 8,
    slug: "bwindi-gorilla-trekking-uganda",
    kind: "package",
    title: "Bwindi Gorilla Trekking Uganda",
    destination: "Uganda",
    destinationKey: "uganda",
    region: "Africa",
    category: "Gorilla Trek / Adventure",
    tags: ["adventure", "safari"],
    duration: "5 Days",
    rating: 4.9,
    reviewCount: 19,
    price: 1890,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Trek through Bwindi's ancient forest for a face-to-face encounter with mountain gorillas.",
    fullDescription:
      "There is no substitute for this one. You trek into Bwindi with certified local trackers, sometimes for an hour and sometimes for most of a morning, until you're sitting a few metres from a mountain gorilla group going about its day. Small groups only, and permits arranged in advance.",
    highlights: [
      "Bwindi Impenetrable Forest",
      "Guided forest trek",
      "Mountain gorilla encounter",
      "Certified local trackers",
      "Small-group experience",
    ],
    image: PACKAGE_IMAGES.gorilla,
    icon: "safari",
  },
  {
    id: 9,
    slug: "south-africa-kruger-cape-town",
    kind: "package",
    title: "South Africa Highlights: Kruger + Cape Town",
    destination: "South Africa",
    destinationKey: "south-africa",
    region: "Africa",
    category: "Safari + City",
    tags: ["safari", "sightseeing", "adventure"],
    duration: "8 Days",
    rating: 4.9,
    reviewCount: 27,
    price: 2890,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Combine Big Five game drives in Kruger with Cape Town, Table Mountain, vineyards and the Cape Peninsula.",
    fullDescription:
      "Two very different halves of the same country. Kruger first, for early game drives and the Big Five, then a flight south to Cape Town for Table Mountain, the winelands, and the drive down the Cape Peninsula where two oceans meet. Good for travellers who want wildlife without giving up restaurants and cities.",
    highlights: [
      "Kruger National Park",
      "Big Five game drives",
      "Cape Town",
      "Table Mountain",
      "Cape vineyards",
      "Cape Peninsula",
    ],
    image: PACKAGE_IMAGES.krugerCape,
    icon: "safari",
  },
  {
    id: 10,
    slug: "ethiopia-lalibela-addis",
    kind: "package",
    title: "Ethiopia Historical Circuit: Lalibela + Addis",
    destination: "Ethiopia",
    destinationKey: "ethiopia",
    region: "Africa",
    category: "Cultural / Heritage",
    tags: ["cultural", "heritage", "sightseeing"],
    duration: "6 Days",
    rating: 4.8,
    reviewCount: 12,
    price: 1690,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Explore Lalibela's rock-hewn churches, Addis Ababa's markets and Ethiopia's extraordinary ancient history.",
    fullDescription:
      "Lalibela's churches were cut downward out of solid rock eight centuries ago and are still in daily use, which is a difficult thing to prepare anyone for. This circuit pairs several days there with Addis Ababa's museums and markets, guided throughout by people who can place what you're looking at in its history.",
    highlights: [
      "Lalibela",
      "Rock-hewn churches",
      "Addis Ababa",
      "Traditional markets",
      "Cultural guides",
      "Ancient history",
    ],
    image: PACKAGE_IMAGES.ethiopia,
    icon: "heritage",
  },
  {
    id: 11,
    slug: "bali-discovery",
    kind: "package",
    title: "Bali Discovery: Temples, Rice Terraces + Beaches",
    destination: "Indonesia",
    destinationKey: "indonesia",
    region: "Asia",
    category: "Discovery / Beach",
    tags: ["beach", "cultural", "sightseeing"],
    duration: "7 Days",
    rating: 4.8,
    reviewCount: 31,
    price: 1290,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Discover ancient temples, sunrise rice terraces, traditional ceremonies and Bali's celebrated beaches.",
    fullDescription:
      "Bali rewards an early alarm — the rice terraces around Ubud are at their best just after sunrise, before the day warms up. This week balances the island's temples and ceremonies, which are living practice rather than exhibits, with enough unstructured beach time that you come home actually rested.",
    highlights: [
      "Balinese temples",
      "Rice terraces",
      "Traditional ceremonies",
      "Ubud",
      "Beach time",
      "Local cultural experiences",
    ],
    image: PACKAGE_IMAGES.bali,
    icon: "beach",
  },
  {
    id: 12,
    slug: "rajasthan-royal-heritage",
    kind: "package",
    title: "Rajasthan Royal Heritage Tour",
    destination: "India",
    destinationKey: "india",
    region: "Asia",
    category: "Heritage",
    tags: ["heritage", "cultural", "sightseeing"],
    duration: "8 Days",
    rating: 4.9,
    reviewCount: 22,
    price: 1490,
    currency: "USD",
    priceUnit: "per person",
    shortDescription:
      "Travel through Rajasthan's palaces, forts and desert landscapes, including Jaipur, Udaipur, Jodhpur and the Taj Mahal.",
    fullDescription:
      "Rajasthan run properly: Jaipur's forts, Udaipur's lake palaces, Jodhpur's blue city and the desert between them, finishing at the Taj Mahal. Eight days is enough to travel it without spending the whole trip in transit, with the major sites scheduled around the quieter hours where possible.",
    highlights: [
      "Jaipur",
      "Udaipur",
      "Jodhpur",
      "Palaces and forts",
      "Desert landscapes",
      "Taj Mahal",
    ],
    image: PACKAGE_IMAGES.rajasthan,
    icon: "heritage",
  },
];

/**
 * Two products, one source. An activity is a single experience booked for a
 * day or less; a package is a multi-day journey. They get their own pages and,
 * later, their own Firestore collections — `kind` is the seam.
 */
export const ACTIVITIES = CATALOGUE.filter((item) => item.kind === "activity");
export const PACKAGES = CATALOGUE.filter((item) => item.kind === "package");

/** Everything, for slug lookups and searches that span both products. */
export const ALL_ITEMS = CATALOGUE;

/**
 * The home page rail. The full catalogue opens with six Dubai day-tours, which
 * buries the long-haul journeys the landing scene is meant to sell, so the row
 * shows this curated run instead — ordered to open on Ethiopia and close on
 * Serengeti.
 *
 * Everything stays in PACKAGES: the navigation filters, the "All Packages"
 * menu item and `#package=` deep links all still reach the whole catalogue.
 * Driven by slug so a reorder here cannot silently pick the wrong package.
 */
const HOME_PACKAGE_SLUGS = [
  "ethiopia-lalibela-addis",
  "south-africa-kruger-cape-town",
  "bwindi-gorilla-trekking-uganda",
  "bali-discovery",
  "rajasthan-royal-heritage",
  "serengeti-safari-zanzibar",
];

export const HOME_PACKAGES = HOME_PACKAGE_SLUGS.map((slug) => {
  const pkg = PACKAGES.find((p) => p.slug === slug);
  if (!pkg) console.warn(`HOME_PACKAGE_SLUGS: no package with slug "${slug}"`);
  return pkg;
}).filter(Boolean);

/** "AED 180 per person" — the bare figure, used in the WhatsApp message. */
export const formatPrice = (pkg) =>
  `${pkg.currency} ${pkg.price.toLocaleString("en-US")} ${pkg.priceUnit}`;

/** "From AED 180 per person" — the display label on cards and in the dialog. */
export const priceLabel = (pkg) => `From ${formatPrice(pkg)}`;

export const findPackageBySlug = (slug) =>
  CATALOGUE.find((pkg) => pkg.slug === slug) || null;

/**
 * Resolve a filter descriptor to a package list. `all` returns everything;
 * unknown filters return an empty list so callers can fall back to WhatsApp.
 */
export function filterPackages({ type, value } = {}, list = CATALOGUE) {
  if (!type || type === "all") return list;
  if (type === "region") return list.filter((p) => p.region === value);
  if (type === "destination")
    return list.filter((p) => p.destinationKey === value);
  if (type === "tag") return list.filter((p) => p.tags.includes(value));
  return [];
}
