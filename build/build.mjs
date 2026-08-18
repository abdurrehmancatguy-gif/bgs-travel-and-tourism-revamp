/**
 * Produces dist/ — the site as a crawler should receive it.
 *
 * The source tree stays exactly as it is, so local development and the admin
 * are unchanged; this only runs at deploy. Three things happen: every category
 * grid gets its cards written into the HTML, every record gets a page of its
 * own, and the usual crawl plumbing gets generated.
 *
 * Why it matters: before this, the raw HTML of visa.html was 107 words with an
 * empty <ul>. Google renders JavaScript, but the answer engines this is aimed
 * at mostly do not, so the catalogue was invisible to them.
 */
import fs from "node:fs";
import path from "node:path";
import { loadContent } from "./content.mjs";
import { cardHtml, itemPath, itemJsonLd, describe, esc, SHAPE, slug } from "./render.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE = (process.env.SITE_URL || "https://bgs-travel-and-tourism.netlify.app").replace(/\/$/, "");

const PAGES = {
  visa: "visa.html", packages: "packages.html", activities: "activities.html",
  destinations: "destinations.html", services: "services.html", mice: "mice.html",
};

const SKIP = new Set(["dist", ".git", "build", "node_modules", "reference", ".DS_Store"]);

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const src = path.join(from, entry.name), dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* ------------------------------------------------------------------ head bits */

const orgJsonLd = () => ({
  "@type": "TravelAgency",
  "@id": `${SITE}/#org`,
  name: "BGS Travel & Tourism",
  url: `${SITE}/`,
  telephone: "+971564891974",
  email: "info@bgstravelandtourism.com",
  address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
  areaServed: "Worldwide",
  logo: `${SITE}/assets/monogram-96.png`,
});

const headExtras = ({ url, title, description, image, jsonLd }) => `
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="BGS Travel &amp; Tourism" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(url)}" />
  ${image ? `<meta property="og:image" content="${esc(image)}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  ${image ? `<meta name="twitter:image" content="${esc(image)}" />` : ""}
  <script type="application/ld+json">${JSON.stringify(
    { "@context": "https://schema.org", "@graph": jsonLd }
  )}</script>`;

/* ------------------------------------------------------------- item pages -- */

function itemPage(item, collection) {
  const s = SHAPE[collection];
  const title = s.title(item);
  const url = `${SITE}/${itemPath(item, collection)}`;
  const image = typeof item.image === "string" ? item.image : item.image?.src;
  const body = describe(item);
  const facts = s.facts(item).filter(([, v]) => v);
  const lists = [["items", "What this covers"], ["highlights", "Highlights"],
                 ["included", "What's included"], ["requirements", "What you'll need"]]
    .map(([key, heading]) => {
      const values = Array.isArray(item[key]) ? item[key].filter(Boolean) : [];
      return values.length ? `<section class="item-page-section"><h2>${esc(heading)}</h2><ul>${
        values.map((v) => `<li>${esc(v)}</li>`).join("")}</ul></section>` : "";
    }).join("");

  // A sentence stating the answer plainly, because that is the form an engine
  // quotes. A table cell is not quotable; "X costs AED n and takes t" is.
  const lede = [
    `${title}${s.kicker(item) ? ` — ${s.kicker(item)}` : ""}.`,
    item.price ? `Priced from ${item.currency ?? "AED"} ${Number(item.price).toLocaleString("en-US")} ${item.priceUnit ?? ""}`.trim() + "." : "",
    item.processing ? `Processing time: ${item.processing}.` : "",
    item.validity ? `Valid ${item.validity}.` : "",
  ].filter(Boolean).join(" ");

  const description = `${lede} ${body}`.trim().slice(0, 300);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${esc(title)} — BGS Travel &amp; Tourism</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/pages.css" />${headExtras({
    url, title: `${title} — BGS Travel & Tourism`, description, image,
    jsonLd: [orgJsonLd(), ...itemJsonLd(item, collection, url, `${SITE}/`), {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: s.label, item: `${SITE}/${PAGES[collection]}` },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    }],
  })}
</head>
<body class="page item-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="item-page-bar">
    <a class="site-logo" href="/">
      <img class="site-logo-mark" src="/assets/monogram-96.png" alt="" width="40" height="40" />
      <span class="site-logo-text">
        <span class="site-logo-name">BGS Travel &amp; Tourism</span>
        <span class="site-logo-place">Dubai, UAE</span>
      </span>
    </a>
  </header>
  <main id="main" class="item-page-main">
    <nav class="item-page-crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">›</span>
      <a href="/${PAGES[collection]}">${esc(s.label)}</a> <span aria-hidden="true">›</span>
      <span aria-current="page">${esc(title)}</span>
    </nav>
    ${image ? `<img class="item-page-media" src="${esc(image)}" alt="${esc(title)}" />` : ""}
    ${s.kicker(item) ? `<p class="item-page-kicker">${esc(s.kicker(item))}</p>` : ""}
    <h1>${esc(title)}</h1>
    <p class="item-page-lede">${esc(lede)}</p>
    ${facts.length ? `<dl class="item-page-facts">${facts.map(([k, v]) =>
      `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
    ${body ? `<p class="item-page-body">${esc(body)}</p>` : ""}
    ${lists}
    <p class="item-page-cta">
      <a class="item-page-button" href="https://wa.me/971564891974?text=${
        encodeURIComponent(`I'd like to know more about ${title}.`)}"
         target="_blank" rel="noopener">Enquire on WhatsApp</a>
    </p>
    <p class="item-page-back"><a href="/${PAGES[collection]}">All ${esc(s.label)}</a></p>
  </main>
  <footer class="page-footer">
    <p><a href="tel:+971564891974">+971 56 489 1974</a> ·
       <a href="mailto:info@bgstravelandtourism.com">info@bgstravelandtourism.com</a></p>
    <p>BGS Travel &amp; Tourism — Dubai, UAE</p>
  </footer>
</body>
</html>`;
}

/* --------------------------------------------------------------------- run -- */

const content = await loadContent();
copyTree(ROOT, DIST);

const urls = [{ loc: `${SITE}/`, pri: "1.0" }];
let cardCount = 0, pageCount = 0;

for (const [collection, file] of Object.entries(PAGES)) {
  const items = Array.isArray(content[collection]) ? content[collection] : [];
  const target = path.join(DIST, file);
  if (!fs.existsSync(target)) continue;

  let html = fs.readFileSync(target, "utf8");
  const copy = content.copy?.[collection] ?? {};
  const title = `${copy.title ?? SHAPE[collection].label} — BGS Travel & Tourism`;
  const pageUrl = `${SITE}/${file}`;

  // 1. the grid, filled
  html = html.replace(
    '<ul class="card-grid" id="card-grid"></ul>',
    `<ul class="card-grid" id="card-grid">${items.map((i) => cardHtml(i, collection)).join("")}</ul>`
  );
  cardCount += items.length;

  // 2. head: canonical, social, and a list of what the page holds
  html = html.replace("</head>", `${headExtras({
    url: pageUrl, title,
    description: copy.intro ?? "",
    image: items[0] && (typeof items[0].image === "string" ? items[0].image : items[0].image?.src),
    jsonLd: [orgJsonLd(), {
      "@type": "ItemList",
      name: SHAPE[collection].label,
      numberOfItems: items.length,
      itemListElement: items.map((item, n) => ({
        "@type": "ListItem", position: n + 1,
        name: SHAPE[collection].title(item),
        url: `${SITE}/${itemPath(item, collection)}`,
      })),
    }],
  })}\n</head>`);
  fs.writeFileSync(target, html);
  urls.push({ loc: pageUrl, pri: "0.8" });

  // 3. a page per record
  for (const item of items) {
    const dir = path.join(DIST, itemPath(item, collection));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), itemPage(item, collection));
    urls.push({ loc: `${SITE}/${itemPath(item, collection)}`, pri: "0.7" });
    pageCount++;
  }
}

/* homepage head */
const home = path.join(DIST, "index.html");
let homeHtml = fs.readFileSync(home, "utf8");
homeHtml = homeHtml.replace("</head>", `${headExtras({
  url: `${SITE}/`,
  title: "BGS Travel & Tourism — Dubai escapes and journeys worldwide",
  description: "Visas, flights, hotels, transfers and tailor-made journeys from Dubai, arranged end to end by one team.",
  image: `${SITE}/assets/icon-512.png`,
  jsonLd: [orgJsonLd(), {
    "@type": "WebSite", "@id": `${SITE}/#site`, url: `${SITE}/`,
    name: "BGS Travel & Tourism", publisher: { "@id": `${SITE}/#org` },
  }],
})}\n</head>`);
fs.writeFileSync(home, homeHtml);

/* sitemap, robots, llms.txt */
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.pri}</priority></url>`).join("\n") +
  `\n</urlset>\n`);

fs.writeFileSync(path.join(DIST, "robots.txt"),
`User-agent: *
Allow: /

# Answer engines. Being readable by these is the point of the pre-render.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /

Disallow: /admin/

Sitemap: ${SITE}/sitemap.xml
`);

const counts = Object.entries(PAGES)
  .map(([c]) => `${(content[c] ?? []).length} ${c}`).join(", ");
fs.writeFileSync(path.join(DIST, "llms.txt"),
`# BGS Travel & Tourism

> A Dubai travel agency arranging visas, flights, hotels, transfers, tours and
> corporate travel. Enquiries are handled over WhatsApp by one team.

Contact: +971 56 489 1974 · info@bgstravelandtourism.com · Dubai, UAE

## What is on this site
${Object.entries(PAGES).map(([c, f]) =>
  `- [${SHAPE[c].label}](${SITE}/${f}) — ${(content[c] ?? []).length} entries, each with its own page`).join("\n")}

Every entry carries its price in AED, processing or duration, and the documents
required. Prices are the published selling price.

## Full index
${Object.entries(PAGES).flatMap(([c]) => (content[c] ?? []).map((i) =>
  `- [${SHAPE[c].title(i)}](${SITE}/${itemPath(i, c)})`)).join("\n")}
`);

console.log(`  cards pre-rendered: ${cardCount}   item pages: ${pageCount}`);
console.log(`  sitemap entries:    ${urls.length}`);
console.log(`  collections:        ${counts}`);
