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
 * Parse the post-login return path from the OAuth state parameter.
 * State format (base64): "<redirectUri>" OR "<redirectUri>||<returnPath>"
 * The returnPath is a relative path like "/beta?ref=LW-XXXX-XXXX".
 * We only allow relative paths (must start with "/") to prevent open redirects.
 */
function parseReturnPath(state: string): string {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf8");
    const sepIdx = decoded.indexOf("||");
    if (sepIdx === -1) return "/";
    const returnPath = decoded.slice(sepIdx + 2);
    // Security: only allow relative paths to prevent open redirect attacks
    if (!returnPath.startsWith("/") || returnPath.startsWith("//")) return "/";
    return returnPath;
  } catch {
    return "/";
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
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
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

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: THIRTY_DAYS_MS });

      // Redirect to the post-login destination encoded in state (defaults to "/")
      const returnPath = parseReturnPath(state);
      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
