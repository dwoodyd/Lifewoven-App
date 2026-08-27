export class SecureDownloadError extends Error {}

/**
 * Requests a newly signed object URL from a still-valid application download
 * token. The token stays in the application domain for 72 hours; the returned
 * storage URL is deliberately short lived and is never persisted in the UI.
 */
export async function redeemFreshDownloadUrl(token: string): Promise<string> {
  const response = await fetch(`/api/download/${encodeURIComponent(token)}?format=json`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const payload = await response.json().catch(() => null) as { url?: unknown; error?: unknown } | null;
  if (!response.ok || typeof payload?.url !== "string") {
    const message = typeof payload?.error === "string"
      ? payload.error
      : "Your secure file link could not be prepared.";
    throw new SecureDownloadError(message);
  }
  return payload.url;
}

/**
 * Opens a blank tab during the click gesture, then navigates it only after the
 * app has successfully obtained a fresh signed URL. Storage errors remain in
 * the Lifewoven UI instead of exposing an XML response in a new tab.
 */
export async function redeemAndOpenDownload(token: string): Promise<void> {
  const destination = window.open("", "_blank");
  if (destination) {
    destination.opener = null;
    destination.document.title = "Preparing your Lifewoven download…";
  }
  try {
    const url = await redeemFreshDownloadUrl(token);
    if (destination) {
      destination.location.replace(url);
    } else {
      window.location.assign(url);
    }
  } catch (error) {
    destination?.close();
    throw error;
  }
}
