import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;
const UPDATE_EVENT = "lifewoven:pwa-update-ready";

export default function PWAUpdatePrompt() {
  const [update, setUpdate] = useState<UpdateServiceWorker | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      setUpdate((event as CustomEvent<UpdateServiceWorker>).detail);
    };
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, handleUpdate);
  }, []);

  if (!update) return null;

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await update(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <aside data-update-protocol="refresh-v2" className="fixed bottom-4 left-4 right-4 z-[10000] mx-auto max-w-md rounded-xl border border-amber-300/30 bg-[#24201b] p-4 text-[#f8f3e8] shadow-2xl" role="status" aria-live="polite">
      <div className="flex gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">A Lifewoven update is ready.</p>
          <p className="mt-1 text-xs leading-5 text-[#d6c7ae]">Refresh when convenient to use the latest experience.</p>
          <button type="button" onClick={refresh} disabled={isRefreshing} className="mt-3 inline-flex min-h-10 items-center rounded-md bg-amber-300 px-3 text-sm font-medium text-[#272019] disabled:opacity-60">
            {isRefreshing ? "Refreshing…" : "Refresh now"}
          </button>
        </div>
        <button type="button" onClick={() => setUpdate(null)} className="-mt-1 -mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-md text-[#d6c7ae] hover:bg-white/10" aria-label="Dismiss update message">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
