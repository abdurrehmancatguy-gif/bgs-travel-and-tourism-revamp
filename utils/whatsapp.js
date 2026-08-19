/**
 * Every WhatsApp link in the site is built here. Nothing else concatenates a
 * wa.me URL, so the number and the message templates live in exactly one place.
 *
 * These links are the only "conversion" path on the site — there is no cart,
 * no checkout and no backend. A link hands the traveller to a real person.
 */

export const WHATSAPP_NUMBER = "971528992964";
export const WHATSAPP_DISPLAY = "052 899 2964";
export const CONTACT_EMAIL = "info@bgstravelandtourism.com";
export const LOCATION = "Dubai, UAE";

/** Base builder — URL-encodes the message onto the BGS number. */
export function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * The package enquiry used by every "Click to Buy" button.
 * @param {string} packageTitle e.g. "Evening Desert Safari with BBQ Dinner"
 * @param {string} price        e.g. "AED 180 per person"
 */
export function buildWhatsAppPackageUrl(packageTitle, price) {
  return buildWhatsAppUrl(
    `Hi BGS Travel & Tourism, I'm interested in the ${packageTitle} package ` +
      `starting from ${price}. Please share availability, dates and booking details.`
  );
}

/** "Tailor-Made Trips" pill and the tailor-made prompts in the menus. */
export function buildCustomTripUrl() {
  return buildWhatsAppUrl(
    "Hi BGS Travel & Tourism, I'd like help planning a tailor-made trip."
  );
}

/** Used when a destination or category has no matching package yet. */
export function buildDestinationEnquiryUrl(destinationName) {
  return buildWhatsAppUrl(
    `Hi BGS Travel & Tourism, I'd like to plan a trip to ${destinationName}. ` +
      `Please share the options you can arrange.`
  );
}

/** The Services scene CTA. */
export function buildPlanTripUrl() {
  return buildWhatsAppUrl(
    "Hi BGS Travel & Tourism, I'd like help planning a complete trip."
  );
}

/** Opens a WhatsApp conversation in a new tab without leaking the opener. */
export function openWhatsApp(url) {
  // The site's only conversion — there is no cart and no checkout — and every
  // WhatsApp link goes through here, so this is the one place worth counting.
  import("../js/analytics.js?v=108")
    .then(({ track }) => track("enquiry_started", {
      intent: decodeURIComponent((url.split("text=")[1] ?? "").slice(0, 120)),
      page: location.pathname,
    }))
    .catch(() => {});
  window.open(url, "_blank", "noopener,noreferrer");
}
