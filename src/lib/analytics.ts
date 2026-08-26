/**
 * GA4 event helpers. The gtag.js snippet itself is hardcoded in index.html's
 * <head> (loads unconditionally, including on localhost — see ARCHITECTURE.md
 * §6.4 for why that changed from an earlier localhost-gated version) with the
 * Measurement ID injected at build time by the Vite plugin in vite.config.ts.
 * This module only adds the custom event/virtual-pageview layer on top.
 *
 * Every exported function is a safe no-op if gtag hasn't loaded for any
 * reason, so call sites never need to guard themselves.
 */

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/**
 * A virtual pageview for this SPA's phase/step changes — there's no real
 * router/URL change to hook. Note: the head snippet's own `gtag('config', ...)`
 * call already sends one automatic pageview on load, so the very first virtual
 * pageview fired here (for the initial "intro" phase) will double up with it.
 * Left as-is to match the requested snippet exactly rather than adding a
 * `send_page_view: false` override that isn't in it — worth knowing if the
 * initial landing pageview count looks inflated in GA.
 */
export function trackPageView(path: string, title: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}
