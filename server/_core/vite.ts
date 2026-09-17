import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

function isMissingJavaScriptAsset(pathname: string) {
  return /^\/assets\/.+\.(?:js|mjs)$/i.test(pathname);
}

function sendMissingJavaScriptAsset(res: express.Response) {
  return res.status(404).set({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  }).send("JavaScript asset not found");
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  // Never transform a missing hashed bundle request into the HTML shell. An
  // old installed shell must receive a meaningful 404, not HTML as JavaScript.
  app.use((req, res, next) => {
    if (isMissingJavaScriptAsset(req.path)) return sendMissingJavaScriptAsset(res);
    next();
  });
  // Exclude server-side routes from the Vite HTML catch-all
  app.use("/{*splat}", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/manus-storage/") || url.startsWith("/api/")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // Keep missing hashed module requests out of the SPA fallback. Returning
  // index.html here causes a stale service-worker shell to fail silently.
  app.use((req, res, next) => {
    if (isMissingJavaScriptAsset(req.path)) return sendMissingJavaScriptAsset(res);
    next();
  });

  // fall through to index.html if the file doesn't exist
  app.use("/{*splat}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
