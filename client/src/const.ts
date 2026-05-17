export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Pass an optional returnPath (e.g. "/beta?ref=LW-XXXX-XXXX") to land on a
// specific page after OAuth completes instead of the default "/".
// The registered OAuth redirect URI (must match what Manus OAuth server has whitelisted)
const REGISTERED_REDIRECT_HOST = "https://lifeosplatform-krrwopfb.manus.space";

export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const currentOrigin = window.location.origin;

  // Always use the registered manus.space redirect URI for OAuth.
  // If the user is on a custom domain (e.g. app.lifewoven.click), the callback
  // will land on manus.space first, then cross-domain redirect back here.
  const registeredRedirectUri = `${REGISTERED_REDIRECT_HOST}/api/oauth/callback`;

  // Encode: registeredRedirectUri + "||" + returnPath + "||" + finalOrigin
  // The server uses finalOrigin to redirect back to the custom domain after login.
  const finalOrigin = currentOrigin !== REGISTERED_REDIRECT_HOST ? currentOrigin : "";
  const statePayload = [registeredRedirectUri, returnPath || "/", finalOrigin]
    .join("||");
  const state = btoa(statePayload);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", registeredRedirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
