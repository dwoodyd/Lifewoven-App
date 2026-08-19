import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { toast } from "sonner";
import App from "./App";
import { AdminPreviewProvider } from "./contexts/AdminPreviewContext";
import { LuminMomentProvider } from "./components/LuminMoment";
import { getLoginUrl } from "./const";
import "./index.css";
import "./view-transitions.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes — prevents redundant refetches as data grows
      retry: 1,
    },
  },
});

// Public pages where guests are expected — never redirect them to login
// even if a background mutation (e.g. trackEvent, completeOnboarding) fails with 401.
const PUBLIC_PATHS = [
  "/",
  "/audit",
  "/pricing",
  "/store",
  "/pathways",
  "/oracle",
  "/community",
  "/character",
  "/beta",
  "/about",
  "/sources",
  "/apply",
  "/invite",
  "/library",
  "/ground",
  "/first-honest-week",
  "/legal",
];

const isPublicPage = () => {
  if (typeof window === "undefined") return true;
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + "/"));
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  // Never redirect guests away from public/marketing pages.
  // The onboarding modal fires auth-required mutations (trackEvent, completeOnboarding)
  // before the user logs in — those should fail silently, not trigger a login redirect.
  if (isPublicPage()) return;

  window.location.href = getLoginUrl(window.location.pathname + window.location.search);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
    // Show user-friendly toast for unhandled mutation errors
    if (error instanceof TRPCClientError && error.message !== UNAUTHED_ERR_MSG) {
      const hasCustomHandler = event.mutation.options?.onError;
      if (!hasCustomHandler) {
        toast.error("Something went wrong", { description: "Please try again. If the issue persists, contact hello@lifewoven.click" });
      }
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <AdminPreviewProvider>
        <LuminMomentProvider>
          <App />
        </LuminMomentProvider>
      </AdminPreviewProvider>
    </QueryClientProvider>
  </trpc.Provider>
);

// Dismiss splash on the first rendered frame; route changes must never feel like a reboot.
const splashStart = Date.now();
const MIN_SPLASH_MS = 0;
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const elapsed = Date.now() - splashStart;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => (window as any).__dismissSplash?.(), remaining);
  });
});
