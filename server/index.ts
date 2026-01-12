import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectDB } from "./db";

// Load environment variables from .env file only in development
// In production (Vercel), environment variables are provided by the platform
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Increase body size limit to handle base64 images (up to 10MB)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Check database connectivity in production
  if (process.env.NODE_ENV === "production") {
    try {
      await connectDB();
      console.log("✅ [PROD] Database is reachable and connected");
    } catch (error: any) {
      console.error("❌ [PROD] Database is NOT reachable:", error.message);
      console.error("❌ [PROD] Database connection failed:", error);
    }
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Only start server if not in Vercel (Vercel will handle the serverless function)
  if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
    // Use PORT environment variable if specified, otherwise use 0 to get any available port
    const requestedPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
    const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    httpServer.listen(
      requestedPort,
      host,
      () => {
        const actualPort = (httpServer.address() as { port: number })?.port || requestedPort;
        log(`serving on port ${actualPort} (${host})`);
      },
    );
  }
})();

// Export the Express app for Vercel serverless functions
// Vercel expects either the app directly or a handler function
export default app;
export { app };
