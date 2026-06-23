import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Returns the current user's beta/paid access status.
 * hasAccess = true  → full features unlocked (beta OR paid OR admin)
 * isExpired = true  → had beta access but it's now expired → show upgrade prompt
 */
export function useBetaAccess() {
  const { user } = useAuth();
  const { data, isLoading } = trpc.beta.myAccess.useQuery(undefined, {
    enabled: !!user,
    staleTime: 60_000,
  });

  const hasAccess = data?.hasAccess ?? false;
  const access = data?.access ?? null;
  // Admin/owner accounts are never considered expired — only show the modal
  // to regular users whose beta trial has genuinely ended.
  const isAdmin = user?.role === "admin";
  const isExpired = !isAdmin && !!access && access.expired;
  const daysLeft = access && !access.expired
    ? Math.ceil((new Date(access.expiresAt).getTime() - Date.now()) / 86_400_000)
    : 0;

  return { hasAccess, isExpired, access, daysLeft, isLoading };
}
