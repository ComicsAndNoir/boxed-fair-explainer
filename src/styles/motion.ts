import type { Transition, Variants } from "framer-motion";

/** MD3 standard easing, expressed as cubic-bezier arrays for Framer Motion. */
export const easingStandard: Transition["ease"] = [0.2, 0, 0, 1];
export const easingEmphasized: Transition["ease"] = [0.3, 0, 0.1, 1];

export const stepTransition: Transition = {
  duration: 0.35,
  ease: easingStandard,
};

export const stepVariants: Variants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * 24,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: stepTransition,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * -24,
    transition: stepTransition,
  }),
};

export const revealVariants: Variants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25, ease: easingStandard },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easingEmphasized },
  },
};
