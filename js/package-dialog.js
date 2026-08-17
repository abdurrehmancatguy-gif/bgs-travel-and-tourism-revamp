import { formatPrice, priceLabel } from "../data/packages.js?v=86";
import { buildWhatsAppPackageUrl } from "../utils/whatsapp.js?v=86";

/**
 * Package detail dialog.
 *
 * Built on the native <dialog> element with showModal(), which gives focus
 * trapping, Escape-to-close and the inert backdrop for free. Backdrop clicks,
 * background scroll locking and focus restoration are the parts we add.
 *
 * The "Click to Buy" button is a plain link to wa.me — no purchase is made,
 * no order is created and nothing is sent anywhere.
 */
export function createPackageDialog({ dialog }) {
  const els = {
    image: dialog.querySelector("#package-dialog-image"),
    kicker: dialog.querySelector("#package-dialog-kicker"),
    title: dialog.querySelector("#package-dialog-title"),
    meta: dialog.querySelector("#package-dialog-meta"),
    desc: dialog.querySelector("#package-dialog-desc"),
    highlights: dialog.querySelector("#package-dialog-highlights"),
    highlightsWrap: dialog.querySelector("#package-dialog-highlights-wrap"),
    included: dialog.querySelector("#package-dialog-included"),
    includedWrap: dialog.querySelector("#package-dialog-included-wrap"),
    price: dialog.querySelector("#package-dialog-price"),
    buy: dialog.querySelector("#package-dialog-buy"),
    close: dialog.querySelector(".package-dialog-close"),
    body: dialog.querySelector(".package-dialog-body"),
  };

  let returnFocusTo = null;
  let scrollLock = "";

  // Sensible target before any package is selected, so the markup never ships
  // a dead `href="#"`. open() overwrites it with the package-specific enquiry.
  els.buy.href = buildWhatsAppPackageUrl("a BGS journey", "the listed rate");

  const listItems = (items) =>
    items.map((item) => `<li>${item}</li>`).join("");

  function open(pkg, triggerEl) {
    returnFocusTo = triggerEl || null;

    els.image.src = pkg.image.src;
    els.image.alt = pkg.image.alt;
    els.kicker.textContent = `${pkg.destination} — ${pkg.category}`;
    els.title.textContent = pkg.title;

    const meta = [pkg.duration, pkg.region];
    if (pkg.rating) {
      meta.push(`${pkg.rating.toFixed(1)} ★ (${pkg.reviewCount} reviews)`);
    }
    els.meta.innerHTML = meta.map((item) => `<li>${item}</li>`).join("");

    els.desc.textContent = pkg.fullDescription;

    if (pkg.highlights?.length) {
      els.highlights.innerHTML = listItems(pkg.highlights);
      els.highlightsWrap.hidden = false;
    } else {
      els.highlightsWrap.hidden = true;
    }

    if (pkg.included?.length) {
      els.included.innerHTML = listItems(pkg.included);
      els.includedWrap.hidden = false;
    } else {
      els.includedWrap.hidden = true;
    }

    els.price.textContent = priceLabel(pkg);
    els.buy.href = buildWhatsAppPackageUrl(pkg.title, formatPrice(pkg));
    els.buy.setAttribute(
      "aria-label",
      `Click to Buy — opens WhatsApp to enquire about ${pkg.title}`
    );

    els.body.scrollTop = 0;

    scrollLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!dialog.open) dialog.showModal();
    window.history.replaceState(null, "", `#package=${pkg.slug}`);
    els.close.focus({ preventScroll: true });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener("close", () => {
    document.body.style.overflow = scrollLock;
    if (window.location.hash.startsWith("#package=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    returnFocusTo?.focus({ preventScroll: true });
    returnFocusTo = null;
  });

  els.close.addEventListener("click", close);

  // Clicking the backdrop closes. The dialog element fills the viewport, so
  // "outside" means outside the inner card's box.
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    if (outside) close();
  });

  return { open, close };
}
