import { createContext, useContext } from "react";

export const STORAGE_KEY = "boxed-explainer:show-jargon";

export interface JargonToggleContextValue {
  showJargon: boolean;
  setShowJargon: (value: boolean) => void;
}

export const JargonToggleContext = createContext<JargonToggleContextValue | null>(null);

export function useJargonToggle(): JargonToggleContextValue {
  const context = useContext(JargonToggleContext);
  if (!context) throw new Error("useJargonToggle must be used within a JargonToggleProvider");
  return context;
}
