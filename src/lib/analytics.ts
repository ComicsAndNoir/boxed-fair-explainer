/**
 * Minimal GA4 wrapper. Two rules drive everything here:
 *  1. Never load or fire on localhost (or any local-dev equivalent) — only
 *     on a real hosted URL. See isLocalHost.
 *  2. Every exported function is a safe no-op before init() runs or when
 *     tracking is disabled, so call sites never need to guard themselves.
 *
 * The measurement ID is a placeholder (see .env.example) until a real GA4
 * property exists — swap it in via VITE_GA_MEASUREMENT_ID, no code changes
 * needed.
 */

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const DUMMY_MEASUREMENT_ID = "G-XXXXXXXXXX";
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || DUMMY_MEASUREMENT_ID;

let enabled = false;

/**
 * Anything a developer would reasonably consider "local dev," not just the
 * literal string "localhost" — 127.0.0.1 and other loopback forms are just
 * as much localhost in practice, and letting analytics fire on them would
 * defeat the point of this check.
 */
export function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost")
  );
}

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (isLocalHost(window.location.hostname)) {
    enabled = false;
    return;
  }

  enabled = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // send_page_view: false — trackPageView below sends every view explicitly,
  // including the first, so gtag's automatic initial pageview would double-count it.
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

export type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: EventParams): void {
  if (!enabled || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/** A virtual pageview for this SPA's phase/step changes — there's no real router/URL change to hook. */
export function trackPageView(path: string, title: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}
