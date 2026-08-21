import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Clears the authenticated session and sends the member to the same confirmed
 * signed-out state from every sign-out control in the app.
 */
export function useSignOut() {
  const { logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await logout();
      window.location.replace("/?signed_out=1");
    } catch {
      toast.error("We could not sign you out. Please try again.");
      setIsSigningOut(false);
    }
  }, [isSigningOut, logout]);

  return { signOut, isSigningOut };
}
