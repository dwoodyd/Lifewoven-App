import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useRef } from "react";

/**
 * Returns the current user's beta/paid access status.
 * hasAccess = true  → full features unlocked (beta OR paid OR admin)
 * isExpired = true  → had beta access but it's now expired → show upgrade prompt
 */
export function useBetaAccess() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.beta.myAccess.useQuery(undefined, {
    enabled: !!user,
    staleTime: 60_000,
  });
  const claimFreeAccess = trpc.beta.claimFreeAccess.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.beta.myAccess.invalidate(),
        utils.store.getAccess.invalidate(),
        utils.store.getProducts.invalidate(),
        utils.auth.me.invalidate(),
      ]);
    },
  });
  const claimedForUser = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id || claimedForUser.current === user.id || claimFreeAccess.isPending) return;
    claimedForUser.current = user.id;
    claimFreeAccess.mutate();
  }, [claimFreeAccess, user?.id]);

  const hasAccess = data?.hasAccess ?? false;
  const access = data?.access ?? null;
  // Admin/owner accounts do not have a beta-access row; only an actual expired
  // record can trigger the continued-path reminder.
  const isExpired = !!access && access.expired;
  const daysLeft = access && !access.expired
    ? Math.ceil((new Date(access.expiresAt).getTime() - Date.now()) / 86_400_000)
    : 0;

  return { hasAccess, isExpired, access, daysLeft, isLoading };
}
