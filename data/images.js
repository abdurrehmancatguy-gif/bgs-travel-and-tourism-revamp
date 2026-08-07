import { PHOTOS } from "./photos.js?v=74";
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
const SCENE_BASE = "https://raft-blast-61784561.figma.site/_assets/v11";

export const SCENE = {
  sky: {
    src: `${SCENE_BASE}/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png`,
    alt: "", // decorative backdrop — the headline carries the meaning
  },
  glow: {
    src: `${SCENE_BASE}/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png`,
    alt: "",
  },
  city: {
    src: `${SCENE_BASE}/864afe00e41e2fa20a5aa546e15cb807e0f81384.png`,
    alt: "",
  },
  curtainLeft: {
    src: `${SCENE_BASE}/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png`,
    alt: "",
  },
  curtainRight: {
    src: `${SCENE_BASE}/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png`,
    alt: "",
  },
  portal: {
    src: `${SCENE_BASE}/c6a6d8ef49bca43f708aa852692942c45ec950d4.png`,
    alt: "A stone arch bridge spanning a river gorge at golden hour",
  },
  reveal: {
    src: `${SCENE_BASE}/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png`,
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
