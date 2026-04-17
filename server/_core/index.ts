import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { stripeWebhookHandler } from "../stripe/webhook";
import { downloadHandler } from "../stripe/download";
import { paypalRouter } from "../paypal/paypal";
import { startWeeklyDigestCron } from "../cron/weeklyDigest";
import { transcribeRouter } from "../transcribeRoute";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";

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

  // ── Security: HTTP security headers via helmet
  app.use(helmet({
    contentSecurityPolicy: false, // managed by Vite in dev
    crossOriginEmbedderPolicy: false,
  }));

  // ── Security: Rate limit auth/OAuth endpoints — 5 attempts per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Too many requests. Please try again later." },
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
  });
  app.use("/api/trpc", apiLimiter);

  // Stripe webhook MUST use raw body BEFORE express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

  // Secure download endpoint — token-based, server-side redirect to S3
  app.get("/api/download/:token", downloadHandler);

  // PayPal payment routes
  app.use(paypalRouter);

  // ── Security: Reduced body limit (50mb was excessive and a DoS risk)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

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
}

startServer().catch(console.error);
startWeeklyDigestCron();
