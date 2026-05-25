import { COOKIE_NAME } from "@shared/const";
import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
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

      const { returnPath, finalOrigin } = parseState(state);

      // Cross-domain redirect: user is on a custom domain (e.g. app.lifewoven.click)
      // but the OAuth callback landed on manus.space.
      //
      // IMPORTANT: We cannot pass the JWT token cross-domain because each Cloud Run
      // instance may have a different JWT_SECRET. Instead, we store a short-lived
      // one-time code in the shared database and redirect the custom domain to exchange
      // it for a fresh JWT signed with its own secret.
      if (finalOrigin) {
        const handoffCode = nanoid(48); // cryptographically random, URL-safe
        await db.createHandoffCode({
          code: handoffCode,
          openId: userInfo.openId,
          name: userInfo.name || null,
          returnPath,
        });
        const handoffUrl = new URL(`${finalOrigin}/api/auth/complete`);
        handoffUrl.searchParams.set("code", handoffCode);
        res.redirect(302, handoffUrl.toString());
        return;
      }

      // Same-domain: create session token and set cookie directly
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: THIRTY_DAYS_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: THIRTY_DAYS_MS });
      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.redirect(302, "/?login_error=callback_failed");
    }
  });

  // Cross-domain auth complete: receives a one-time code from the manus.space callback,
  // looks up the user in the shared database, and creates a fresh JWT signed with THIS
  // instance's JWT_SECRET before setting the session cookie.
  app.get("/api/auth/complete", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");

    if (!code) {
      res.redirect(302, "/?login_error=missing_code");
      return;
    }

    try {
      // Exchange the one-time code for user info (marks code as used)
      const handoff = await db.consumeHandoffCode(code);
      if (!handoff) {
        res.redirect(302, "/?login_error=invalid_or_expired_code");
        return;
      }

      // Security: only allow relative paths
      const safePath = handoff.returnPath.startsWith("/") && !handoff.returnPath.startsWith("//")
        ? handoff.returnPath
        : "/";

      // Create a fresh JWT signed with THIS instance's JWT_SECRET
      const sessionToken = await sdk.createSessionToken(handoff.openId, {
        name: handoff.name || "",
        expiresInMs: THIRTY_DAYS_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: THIRTY_DAYS_MS });
      res.redirect(302, safePath);
    } catch (error) {
      console.error("[Auth] Complete failed", error);
      res.redirect(302, "/?login_error=complete_failed");
    }
  });
}
