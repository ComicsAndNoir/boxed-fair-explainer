import { useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const COLLAPSE_THRESHOLD_PX = 16;

/**
 * Tracks whether a descendant scroll container has moved away from the top,
 * on mobile-width viewports only. Attaches its scroll listener in the
 * capture phase on a wrapper ref, so it works no matter which inner panel
 * (StepShell's content, Overview's wrapper, ...) is actually the one
 * scrolling — scroll events don't bubble, but capture-phase listeners on an
 * ancestor still see them, so no plumbing through each child is needed.
 */
export function useMobileScrollCollapse() {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const mql = window.matchMedia(MOBILE_QUERY);

    function handleScroll(event: Event) {
      if (!mql.matches) return;
      const target = event.target as HTMLElement;
      if (typeof target.scrollTop !== "number") return;
      setCollapsed(target.scrollTop > COLLAPSE_THRESHOLD_PX);
    }

    function handleMediaChange() {
      if (!mql.matches) setCollapsed(false);
    }

    root.addEventListener("scroll", handleScroll, true);
    mql.addEventListener("change", handleMediaChange);
    return () => {
      root.removeEventListener("scroll", handleScroll, true);
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return { scrollRootRef, disclaimerCollapsed: collapsed };
}
