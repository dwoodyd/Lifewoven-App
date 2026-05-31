/**
 * Lifewoven Spring Configs
 * All motion in the app uses these named springs — never raw CSS transitions.
 * Compatible with framer-motion v12 (Transition type).
 */

import type { Transition } from "framer-motion";

/** Default spring: balanced, used for most UI transitions */
export const defaultSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 1,
};

/** Gentle spring: slow, used for Lumin appearances and ambient elements */
export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 24,
  mass: 1,
};

/** Snappy spring: fast, used for button presses and quick toggles */
export const snappySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

/** Page transition spring: used for route changes */
export const pageSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 1,
};

/** Modal spring: scale + opacity entrance */
export const modalSpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.9,
};

/** Card hover spring: subtle lift */
export const cardHoverSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
  mass: 0.8,
};
