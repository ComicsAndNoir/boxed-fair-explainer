import { useEffect, useMemo, useState, type ReactNode } from "react";
import { JargonToggleContext, STORAGE_KEY } from "../../hooks/jargonToggleContext";

/** Global control (requirements Section 6). Default OFF — plain language only. */
export function JargonToggleProvider({ children }: { children: ReactNode }) {
  const [showJargon, setShowJargon] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(showJargon));
    } catch {
      // Storage unavailable (private mode, etc.) — toggle still works for this session.
    }
  }, [showJargon]);

  const value = useMemo(() => ({ showJargon, setShowJargon }), [showJargon]);

  return <JargonToggleContext.Provider value={value}>{children}</JargonToggleContext.Provider>;
}
