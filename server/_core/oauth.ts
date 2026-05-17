import { COOKIE_NAME } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

// H4: Session TTL capped at 30 days (was 1 year)
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Parse the OAuth state parameter.
 * State format (base64): "<redirectUri>||<returnPath>||<finalOrigin>"
 * - redirectUri: the registered redirect URI used for the OAuth exchange
 * - returnPath: relative path to redirect to after login (defaults to "/")
 * - finalOrigin: if set, redirect to this origin after setting the cookie
 *   (used when the user is on a custom domain like app.lifewoven.click)
 */
function parseState(state: string): { returnPath: string; finalOrigin: string } {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf8");
    const parts = decoded.split("||");
    // parts[0] = redirectUri, parts[1] = returnPath, parts[2] = finalOrigin
    const returnPath = parts[1] || "/";
    const finalOrigin = parts[2] || "";

    // Security: only allow relative paths to prevent open redirect attacks
    const safePath = returnPath.startsWith("/") && !returnPath.startsWith("//")
      ? returnPath
      : "/";

    // Security: only allow known safe origins for cross-domain redirect
    const safeOrigins = [
      /^https:\/\/([a-z0-9-]+\.)*lifewoven\.click$/,
      /^https:\/\/([a-z0-9-]+\.)*manus\.space$/,
      /^https:\/\/([a-z0-9-]+\.)*manus\.computer$/,
      /^http:\/\/localhost(:\d+)?$/,
    ];
    const safeFinalOrigin = safeOrigins.some(r => r.test(finalOrigin)) ? finalOrigin : "";

    return { returnPath: safePath, finalOrigin: safeFinalOrigin };
  } catch {
    return { returnPath: "/", finalOrigin: "" };
  }
}

export function registerOAuthRoutes(app: Express) {
  // The Manus OAuth portal may redirect to /manus-oauth/callback — forward to the real handler
  app.get("/manus-oauth/callback", (req: Request, res: Response) => {
    const qs = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(302, `/api/oauth/callback${qs ? `?${qs}` : ""}`);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.redirect(302, "/?login_error=missing_params");
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.redirect(302, "/?login_error=missing_openid");
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: THIRTY_DAYS_MS,
      });

      const { returnPath, finalOrigin } = parseState(state);

      // Cross-domain redirect: user is on a custom domain (e.g. app.lifewoven.click)
      // but the OAuth callback landed on manus.space. We need to hand off the session
      // token to the custom domain so it can set its own cookie.
      if (finalOrigin) {
        const handoffUrl = new URL(`${finalOrigin}/api/auth/complete`);
        handoffUrl.searchParams.set("token", sessionToken);
        handoffUrl.searchParams.set("returnPath", returnPath);
        res.redirect(302, handoffUrl.toString());
        return;
      }

      // Same-domain: set cookie directly
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: THIRTY_DAYS_MS });
      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.redirect(302, "/?login_error=callback_failed");
    }
  });

  // Cross-domain auth complete: receives a session token from the manus.space callback
  // and sets it as a cookie on the current domain (e.g. app.lifewoven.click).
  app.get("/api/auth/complete", async (req: Request, res: Response) => {
    const token = getQueryParam(req, "token");
    const returnPath = getQueryParam(req, "returnPath") || "/";

    if (!token) {
      res.redirect(302, "/?login_error=missing_token");
      return;
    }

    try {
      // Verify the token is valid (signed with our JWT_SECRET)
      const payload = await sdk.verifySession(token);
      if (!payload) {
        res.redirect(302, "/?login_error=invalid_token");
        return;
      }

      // Security: only allow relative paths
      const safePath = returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? returnPath
        : "/";

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: THIRTY_DAYS_MS });
      res.redirect(302, safePath);
    } catch (error) {
      console.error("[Auth] Complete failed", error);
      res.redirect(302, "/?login_error=complete_failed");
    }
  });
}
