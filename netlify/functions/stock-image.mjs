/**
 * One landscape stock photograph for a query, from Pexels.
 *
 * This exists so the API key stays on the server. The same lookup made from the
 * admin page would ship the key in page source, where anyone could read it.
 *
 * Set PEXELS_KEY in Netlify → Site configuration → Environment variables. With
 * no key the function answers 200 with an empty url rather than an error: a
 * missing photograph should leave a record without one, not fail the import.
 */
const REJECT = /black and white|monochrome|grayscale|greyscale|illustration/i;

export default async (request) => {
  const query = new URL(request.url).searchParams.get("q");
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", "cache-control": "public, max-age=86400" },
    });

  if (!query) return json({ url: "", reason: "no query" }, 400);
  const key = process.env.PEXELS_KEY;
  if (!key) return json({ url: "", reason: "PEXELS_KEY is not set on this site" });

  try {
    const res = await fetch(
      "https://api.pexels.com/v1/search?" + new URLSearchParams({
        query, orientation: "landscape", per_page: "15",
      }),
      { headers: { Authorization: key } }
    );
    if (!res.ok) return json({ url: "", reason: `Pexels returned ${res.status}` });

    const { photos = [] } = await res.json();
    const usable = photos.filter(
      (p) => !REJECT.test(`${p.alt ?? ""} ${p.url}`)
    );
    const pick = usable[0] ?? photos[0];
    return json({
      url: pick?.src?.landscape ?? "",
      alt: pick?.alt ?? "",
      photographer: pick?.photographer ?? "",
    });
  } catch (error) {
    return json({ url: "", reason: error.message });
  }
};

export const config = { path: "/api/stock-image" };
