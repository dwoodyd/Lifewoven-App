import "dotenv/config";
import express from "express";
import { notifyOwner } from "./notification";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { downloadHandler } from "../downloadHandler";
import { paypalRouter } from "../paypal/paypal";
import { paypalSubscriptionRouter } from "../paypal/subscriptions";
import { startWeeklyDigestCron } from "../cron/weeklyDigest";
import { startBetaExpiryCheckCron } from "../cron/betaExpiryCheck";
import { startFoundingLifecycleCron } from "../cron/foundingLifecycle";
import { transcribeRouter } from "../transcribeRoute";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { Redis } from "ioredis";
import { RedisStore } from "rate-limit-redis";
import { getDb } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the first proxy (required for accurate IP detection behind load balancers/CDN)
  app.set("trust proxy", 1);

  // ── Performance: Gzip/Brotli compression for all responses
  app.use(compression());

  // ── Security: HTTPS enforcement — redirect HTTP to HTTPS in production
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const proto = req.headers["x-forwarded-proto"];
      if (proto && proto !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
    }
    next();
  });

  // ── Security: Explicit CORS whitelist — no wildcard
  const allowedOrigins = [
    /\.manus\.space$/,
    /\.manus\.computer$/,
    /\.us1\.manus\.computer$/,
    /^https:\/\/lifewovenapp\.manus\.space$/,
    /^https:\/\/lifeosplatform-krrwopfb\.manus\.space$/,
    /^https:\/\/([a-z0-9-]+\.)?lifewoven\.click$/,
    ...(process.env.NODE_ENV !== "production" ? [/^http:\/\/localhost(:\d+)?$/] : []),
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server
      const allowed = allowedOrigins.some(p => p.test(origin));
      callback(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
    credentials: true,
  }));

  // ── Security: HTTP security headers via helmet (H5: CSP re-enabled)
  const isDev = process.env.NODE_ENV === "development";
  app.use(helmet({
    contentSecurityPolicy: isDev ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.sandbox.paypal.com", "https://manus-analytics.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        mediaSrc: ["'self'", "blob:", "https://d36hbw14aib5lz.cloudfront.net", "https://*.cloudfront.net", "https://*.manus.space"],
        connectSrc: ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com", "https://manus-analytics.com", "https://*.cloudfront.net"],
        frameSrc: ["https://www.paypal.com", "https://www.sandbox.paypal.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // ── Redis rate-limit store: use Redis when REDIS_URL is set, fall back to memory
  let redisStore: RedisStore | undefined;
  if (process.env.REDIS_URL) {
    try {
      const redisClient = new Redis(process.env.REDIS_URL, {
        enableOfflineQueue: false,
        connectTimeout: 3000,
        lazyConnect: true,
      });
      await redisClient.connect().catch(() => null);
      if (redisClient.status === "ready") {
        redisStore = new RedisStore({
          // ioredis `call` accepts (command, ...args) — wrap to match rate-limit-redis signature
          sendCommand: (command: string, ...args: string[]) => redisClient.call(command, ...args) as any,
        });
        console.log("[RateLimit] Redis store connected — rate limits shared across replicas");
      } else {
        console.warn("[RateLimit] Redis connection failed — falling back to in-memory store (not suitable for multi-replica)");
        redisClient.disconnect();
      }
    } catch (err) {
      console.warn("[RateLimit] Redis init error — falling back to in-memory store:", (err as Error).message);
    }
  } else {
    console.warn("[RateLimit] REDIS_URL not set — using in-memory store (not suitable for multi-replica deployments)");
  }

  // ── Security: Rate limit auth/OAuth endpoints — 5 attempts per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Too many requests. Please try again later." },
    ...(redisStore ? { store: redisStore } : {}),
  });
  app.use("/api/oauth", authLimiter);

  // ── Security: General API rate limit — 200 requests per minute per IP
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Too many requests. Please try again later." },
    ...(redisStore ? { store: redisStore } : {}),
  });
  app.use("/api/trpc", apiLimiter);
  // M5: Apply rate limiter to transcribe and PayPal endpoints too
  app.use("/api/transcribe", apiLimiter);
  app.use("/api/paypal", apiLimiter);
  app.use("/api/paypal/subscription", apiLimiter);

  // ── Health check endpoint — DB ping + uptime (no auth required)
  app.get("/api/health", async (_req, res) => {
    const start = Date.now();
    try {
      const db = await getDb();
      if (db) await db.execute("SELECT 1");
      res.json({
        status: "ok",
        uptime: Math.floor(process.uptime()),
        db: db ? "connected" : "unavailable",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({ status: "degraded", db: "error", uptime: Math.floor(process.uptime()) });
    }
  });

  // 301 redirects: /btw → /ground (permanent rename)
  app.get("/btw", (_req, res) => res.redirect(301, "/ground"));
  app.get("/btw/*", (req, res) => {
    const sub = req.path.replace(/^\/btw/, "");
    res.redirect(301, `/ground${sub}`);
  });

  // Secure download endpoint — token-based, server-side redirect to S3
  app.get("/api/download/:token", downloadHandler);

  // PayPal payment routes
  app.use(paypalRouter);
  app.use("/api/paypal/subscription", paypalSubscriptionRouter);

  // ── Security: Reduced body limit (50mb was excessive and a DoS risk)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Storage proxy for /manus-storage/* assets (PWA icons, uploads)
  registerStorageProxy(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Voice transcription upload endpoint
  app.use(transcribeRouter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // L5: Only start cron jobs when explicitly enabled (prevents duplicate runs in multi-replica)
  if (process.env.ENABLE_CRONS === "1") {
    startWeeklyDigestCron();
    startBetaExpiryCheckCron();
    startFoundingLifecycleCron();
    console.log("[Cron] Weekly digest, beta expiry, and founding lifecycle crons started");
  }

  // ── Graceful shutdown: drain in-flight requests before exiting
  const shutdown = (signal: string) => {
    console.log(`[Server] ${signal} received — starting graceful shutdown`);
    server.close((err) => {
      if (err) {
        console.error("[Server] Error during shutdown:", err);
        process.exit(1);
      }
      console.log("[Server] All connections closed — exiting cleanly");
      process.exit(0);
    });
    // Force-kill after 10 seconds if connections don't drain
    setTimeout(() => {
      console.error("[Server] Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

startServer().catch(console.error);

// ── Global error alerting — catch unhandled promise rejections and exceptions
// These indicate bugs that escaped all try/catch blocks; alert owner immediately
const _alertedErrors = new Set<string>();
function alertOwnerOnce(label: string, err: unknown) {
  const key = String(err).slice(0, 120);
  if (_alertedErrors.has(key)) return; // deduplicate within process lifetime
  _alertedErrors.add(key);
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? "").slice(0, 500) : "";
  notifyOwner({
    title: `⚠️ Server Error: ${label}`,
    content: `**${message}**\n\n${stack}\n\nTimestamp: ${new Date().toISOString()}`,
  }).catch(() => {}); // never throw from the error handler itself
}

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled promise rejection:", reason);
  alertOwnerOnce("Unhandled Rejection", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception:", err);
  alertOwnerOnce("Uncaught Exception", err);
  // Give the alert 2 seconds to send, then exit (Node is in undefined state)
  setTimeout(() => process.exit(1), 2_000).unref();
});
