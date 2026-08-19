import { POSTHOG_KEY, POSTHOG_HOST, isConfigured } from "./analytics-config.js?v=132";

/**
 * Product analytics, and the only file that knows PostHog exists.
 *
 * Nothing is loaded until a project key is present, so an unconfigured site
 * fetches no script and sets no cookie — the same shape as js/cloud.js, and for
 * the same reason: a feature nobody has configured should cost nothing.
 *
 * Beyond autocapture, three things are worth naming explicitly because they are
 * what this business actually cares about: which visa or package someone opened,
 * what they searched for, and whether they went through to WhatsApp. That last
 * one is the site's only conversion — there is no cart and no checkout.
 */

const CDN = "https://cdn.jsdelivr.net/npm/posthog-js@1/+esm";

let ready = null;

function connect() {
  if (!isConfigured()) return Promise.resolve(null);
  if (ready) return ready;

  ready = import(CDN)
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Nobody signs in on the public site, so profiles would be noise and
        // cost. The admin is the only place a person is identifiable.
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        // A visitor who has asked not to be tracked has asked not to be tracked.
        respect_dnt: true,
        // PostHog's remote config pulls a surveys bundle by default, and a
        // survey launched from the dashboard would render its own popup over
        // the site. Nobody here wants a questionnaire appearing mid-booking,
        // and not fetching the script is also a request the visitor is spared.
        disable_surveys: true,
        // The admin edits real prices and documents; recording its inputs would
        // put catalogue content into a third party for no benefit.
        autocapture: { css_selector_allowlist: undefined },
        mask_all_text: false,
        loaded: (ph) => {
          if (document.body.classList.contains("admin")) ph.opt_out_capturing();
        },
      });
      return posthog;
    })
    .catch((error) => {
      // A blocked CDN, an ad blocker, an offline visitor: none of these are
      // reasons for the site to misbehave.
      console.warn("analytics: PostHog unavailable —", error.message);
      ready = null;
      return null;
    });

  return ready;
}

/** Fire and forget. Never awaited by anything the visitor is waiting on. */
export function track(event, properties = {}) {
  if (!isConfigured()) return;
  connect().then((ph) => ph?.capture(event, properties)).catch(() => {});
}

export const analyticsEnabled = () => isConfigured();

/* Start as the module loads, so the pageview is not delayed by a first event. */
if (isConfigured()) connect();
