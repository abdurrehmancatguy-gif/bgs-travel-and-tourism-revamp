import {
  WHATSAPP_DISPLAY, CONTACT_EMAIL, LOCATION, buildWhatsAppUrl,
} from "../utils/whatsapp.js?v=77";

/**
 * Contact details and the legal notices, as data rather than markup, so the
 * same content feeds every surface that shows it and can later be pointed at
 * the store the way the rest of the catalogue is.
 *
 * The three notices are deliberately empty. Legal text is not something to
 * approximate — a drafted-in placeholder reads as published policy and commits
 * BGS to whatever it happens to say. The panels exist and open; the wording
 * gets pasted into the sections below once it has been written and reviewed.
 *
 * To publish one, give it an intro and push { heading, body: [...] } objects
 * into its sections array. The renderer shows the empty state until then.
 */

export const CONTACT_CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    // Built here rather than concatenated, so this link carries the same
    // opening message as every other WhatsApp entry point on the site.
    href: buildWhatsAppUrl("Hi BGS Travel & Tourism, I'd like help planning a trip."),
    note: "Fastest way to reach the team.",
  },
  {
    key: "email",
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    note: "For itineraries, quotes and documents.",
  },
  {
    key: "office",
    label: "Office",
    value: LOCATION,
    href: "",
    note: "",
  },
];

export const LEGAL_DOCS = {
  contact: {
    title: "Contact BGS Travel & Tourism",
    kind: "contact",
    intro:
      "One team handles the whole journey — planning, booking and everything in between.",
  },

  privacy: { title: "Privacy Policy", intro: "", sections: [] },
  terms: { title: "Terms & Conditions", intro: "", sections: [] },
  cookies: { title: "Cookie Policy", intro: "", sections: [] },
};

/** The order the buttons appear in, so markup and content cannot disagree. */
export const LEGAL_LINKS = [
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
  { key: "cookies", label: "Cookies" },
];
