/**
 * Firebase project settings. THIS IS THE ONLY FILE YOU NEED TO EDIT.
 *
 * Paste the config object from the Firebase console below:
 *   Firebase console → your project → ⚙ Project settings → General →
 *   "Your apps" → the web app (</> icon) → "SDK setup and configuration" →
 *   select "Config" → copy the values into FIREBASE_CONFIG.
 *
 * Until apiKey and projectId are filled in, the site runs exactly as it does
 * today: content comes from the bundled data files with admin edits kept in
 * this browser's localStorage. Nothing breaks, nothing syncs. Fill them in and
 * the same admin starts writing to Firestore instead, with every open page
 * updating live.
 *
 * These values are NOT secrets. A Firebase web config is public by design and
 * ships in every client; what protects the data is the Firestore security
 * rules, not the config. See FIREBASE.md for the rules this project expects.
 */
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

/**
 * Which Firestore collection holds the site content. One document per content
 * collection — activities, packages, destinations, services, visa, mice, copy.
 */
export const CONTENT_COLLECTION = "content";

/** Pinned rather than floating, so a new SDK release cannot change the site. */
export const SDK_VERSION = "11.10.0";

/** Nothing cloud-related is even imported until this is true. */
export const isConfigured = () =>
  Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
