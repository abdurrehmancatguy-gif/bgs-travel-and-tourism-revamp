import {
  WHATSAPP_DISPLAY, CONTACT_EMAIL, LOCATION, buildWhatsAppUrl,
} from "../utils/whatsapp.js?v=76";

/**
 * Contact details and the legal notices, as data rather than markup, so the
 * same content feeds every surface that shows it and can later be pointed at
 * the store the way the rest of the catalogue is.
 *
 * IMPORTANT: the notices below are drafts, not reviewed legal text. They are
 * written to describe what this site actually does — no accounts, no payment
 * taken here, no analytics — rather than to make commitments that have not been
 * checked. Have them reviewed before the site goes live, and replace anything
 * that does not match how BGS really handles enquiries and data.
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

const UPDATED = "10 August 2026";

export const LEGAL_DOCS = {
  contact: {
    title: "Contact BGS Travel & Tourism",
    kind: "contact",
    intro:
      "One team handles the whole journey — planning, booking and everything in between.",
  },

  privacy: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro:
      "This site is a brochure, not an account system. It asks for nothing and stores nothing about you on our servers.",
    sections: [
      {
        heading: "What this website collects",
        body: [
          "Nothing. There is no sign-up, no contact form that posts to us and no analytics or advertising script on these pages. Browsing the site does not create a record we hold about you.",
          "Our hosting provider keeps standard server logs, such as IP address and the pages requested, for security and to keep the site running. Those logs are the provider's, kept under their own policy.",
        ],
      },
      {
        heading: "When you get in touch",
        body: [
          "If you message us on WhatsApp or send an email, we receive whatever you choose to tell us — typically your name, your contact details and the trip you are asking about. We use it to answer you and to arrange what you ask us to arrange, and for nothing else.",
          "WhatsApp is operated by Meta and email by our mail provider, so a message sent that way also passes through their systems under their own terms.",
        ],
      },
      {
        heading: "Sharing with suppliers",
        body: [
          "Booking a trip means passing the details a supplier needs — an airline, a hotel, a transport company, a visa authority — to that supplier. We share only what the booking requires, and only with the suppliers involved in your trip.",
          "We do not sell contact details or pass them to anyone for marketing.",
        ],
      },
      {
        heading: "Content loaded from elsewhere",
        body: [
          "Photographs on this site are served from Wikimedia Commons and the display typeface from a content delivery network. Loading them tells those services your browser requested a file, in the same way visiting any website does.",
        ],
      },
      {
        heading: "Storage on your own device",
        body: [
          "The site uses your browser's local storage only for the staff editing tools, and only on the device of whoever is editing. It is not used to track visitors and never leaves the device.",
        ],
      },
      {
        heading: "Your rights and how to reach us",
        body: [
          "You can ask what we hold about you, ask for it to be corrected, or ask us to delete it. Write to us and we will act on it.",
          `Email ${CONTACT_EMAIL} or message ${WHATSAPP_DISPLAY}.`,
        ],
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    updated: UPDATED,
    intro:
      "What you can expect from the information on this site, and what is settled at the point of booking rather than here.",
    sections: [
      {
        heading: "This site is information, not an offer",
        body: [
          "Destinations, packages, activities and services shown here describe what BGS Travel & Tourism can arrange. They are not a binding offer, and nothing on this site forms a contract on its own.",
          "A booking exists once we have confirmed it with you directly and the supplier has confirmed it with us.",
        ],
      },
      {
        heading: "Prices and availability",
        body: [
          "Any price shown is indicative and depends on dates, group size, season and what the supplier is charging at the time. Availability is not held by anything on this page.",
          "The price that applies is the one we quote and you accept in writing when booking.",
        ],
      },
      {
        heading: "Suppliers and their terms",
        body: [
          "Flights, hotels, transport, tours and venues are provided by third parties. Their own booking conditions, including their cancellation, change and refund rules, apply to your trip alongside ours.",
          "We arrange and coordinate those services. We are not the operator of them.",
        ],
      },
      {
        heading: "Visas and travel documents",
        body: [
          "We prepare and submit visa applications and track them for you. The decision belongs to the relevant government authority, and no visa outcome or processing time can be guaranteed by us.",
          "Making sure your passport, onward tickets and entry requirements are in order remains yours.",
        ],
      },
      {
        heading: "Content on this site",
        body: [
          "The BGS name, monogram and the wording of these pages belong to BGS Travel & Tourism. Photographs are used from Wikimedia Commons under their respective licences and belong to their photographers.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of the United Arab Emirates, and the courts of Dubai have jurisdiction over any dispute arising from them.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    updated: UPDATED,
    intro:
      "The short version: this site sets no tracking cookies, so there is no banner to dismiss.",
    sections: [
      {
        heading: "What we set",
        body: [
          "No advertising cookies, no analytics cookies and no cross-site tracking. The site works without them, so it does not ask for them.",
        ],
      },
      {
        heading: "Local storage",
        body: [
          "The staff editing tools save work in the browser's local storage on the editor's own device. It holds site content, not visitor data, and is never sent anywhere.",
        ],
      },
      {
        heading: "Third parties",
        body: [
          "Following a WhatsApp link takes you to Meta's service, which applies its own cookies and terms once you are there. The same is true of any supplier site we link you to.",
        ],
      },
    ],
  },
};

/** The order the buttons appear in, so markup and content cannot disagree. */
export const LEGAL_LINKS = [
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
  { key: "cookies", label: "Cookies" },
];
