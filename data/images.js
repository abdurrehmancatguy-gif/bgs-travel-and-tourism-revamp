import { PHOTOS } from "./photos.js?v=111";
/**
 * Every image URL used by the site lives here — swap a value and the whole
 * page follows. Nothing else in the codebase hardcodes an image address.
 *
 * Current sources are freely-licensed Wikimedia Commons files served through
 * Special:FilePath, which redirects to a width-scaled render. To move to BGS's
 * own photography, replace the `src` values with your CDN URLs; the `alt` text
 * and the layer contract (see SCENE below) are what the layout depends on.
 */

const commons = (file, width = 2400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    file.replace(/ /g, "_")
  )}?width=${width}`;

/**
 * Cinematic scene layers, back to front.
 *
 * IMPORTANT — these are not interchangeable with ordinary photographs. The
 * composition depends on the alpha channel: `portal` is an arch cut out of a
 * transparent sky, and `curtainLeft`/`curtainRight` are transparent-edge
 * frames that part to open the scene. Dropping an opaque JPEG into those three
 * slots covers the whole stage. `sky`, `glow`, `city` and `reveal` are
 * full-bleed plates and will accept any landscape image.
 *
 * Replacing these with BGS artwork therefore needs transparent PNGs for the
 * portal and curtains; everything else is a straight URL swap.
 *
 * Only `sky` is fetched eagerly; the rest are lazy.
 */
/**
 * Served from this site, not the Figma preview these were exported from. The
 * originals were seven 4K PNGs totalling 32MB on first paint, which is why the
 * homepage took so long to show anything. Re-encoded to WebP at 2048px (1600px
 * for the framing layers, which never fill the viewport) they come to 0.95MB —
 * a 97% cut — with the alpha the composition depends on intact.
 *
 * `sky` is the exception: it is genuinely opaque, measured by sampling its
 * pixels rather than assumed, so it carries no alpha and is the smallest at
 * 42KB.
 */
const SCENE_BASE = "assets/scene";

export const SCENE = {
  sky: {
    src: `${SCENE_BASE}/sky.webp`,
    alt: "", // decorative backdrop — the headline carries the meaning
  },
  glow: {
    src: `${SCENE_BASE}/glow.webp`,
    alt: "",
  },
  city: {
    src: `${SCENE_BASE}/city.webp`,
    alt: "",
  },
  curtainLeft: {
    src: `${SCENE_BASE}/curtainLeft.webp`,
    alt: "",
  },
  curtainRight: {
    src: `${SCENE_BASE}/curtainRight.webp`,
    alt: "",
  },
  portal: {
    src: `${SCENE_BASE}/portal.webp`,
    alt: "A stone arch bridge spanning a river gorge at golden hour",
  },
  reveal: {
    src: `${SCENE_BASE}/reveal.webp`,
    alt: "",
  },
};

/** Package photography — shown inside the detail dialog, loaded on demand. */
export const PACKAGE_IMAGES = {
  desertSafari: {
    src: PHOTOS.desertSafari,
    alt: "Four-wheel drives crossing the dunes on a Dubai desert safari",
  },
  dhowCruise: {
    src: PHOTOS.dhowCruise,
    alt: "A traditional wooden dhow moored on Dubai Creek",
  },
  helicopter: {
    src: PHOTOS.helicopter,
    alt: "Aerial view of the Palm Jumeirah island in Dubai",
  },
  dubaiFrame: {
    src: PHOTOS.dubaiFrame,
    alt: "The observation deck of the Dubai Frame looking out over the city",
  },
  hotAirBalloon: {
    src: PHOTOS.hotAirBalloon,
    alt: "A hot air balloon drifting low over desert dunes at sunrise",
  },
  familyDay: {
    src: PHOTOS.familyDay,
    alt: "The Dubai Fountain performing in front of the Burj Khalifa",
  },
  serengeti: {
    src: PHOTOS.serengeti,
    alt: "Wildebeest crossing the plains during the Serengeti migration",
  },
  gorilla: {
    src: PHOTOS.bwindi,
    alt: "A mountain gorilla feeding in dense forest undergrowth",
  },
  krugerCape: {
    src: PHOTOS.southAfrica,
    alt: "Table Mountain rising behind the city of Cape Town",
  },
  ethiopia: {
    src: PHOTOS.ethiopia,
    alt: "The rock-hewn Church of Saint George at Lalibela at sunset",
  },
  bali: {
    src: PHOTOS.bali,
    alt: "Terraced rice paddies stepping down a hillside in Bali",
  },
  rajasthan: {
    src: PHOTOS.rajasthan,
    alt: "The Taj Mahal reflected in its watercourse at Agra",
  },
};
