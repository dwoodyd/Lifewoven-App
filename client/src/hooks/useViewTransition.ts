/**
 * useViewTransition — wraps navigation in the View Transitions API
 * Falls back gracefully when the API is not available (Firefox, older Safari).
 *
 * Usage:
 *   const navigate = useViewTransition();
 *   navigate("/dashboard");
 */

import { useCallback } from "react";
import { useLocation } from "wouter";

export function useViewTransition() {
  const [, setLocation] = useLocation();

  const navigate = useCallback(
    (to: string) => {
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (document as Document & { startViewTransition: (cb: () => void) => void })
          .startViewTransition(() => {
            setLocation(to);
          });
      } else {
        setLocation(to);
      }
    },
    [setLocation]
  );

  return navigate;
}
