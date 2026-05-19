import express, { type Express } from "express";
import type { SymbolRegistry } from "./symbols/symbol-registry.js";
import { createHealthRoutes } from "./health/health.routes.js";
import { createInternalRoutes } from "./internal/internal.routes.js";

export function createApp(registry: SymbolRegistry): Express {
  const app = express();

  app.use(express.json());
  app.use("/health", createHealthRoutes());
  app.use("/internal", createInternalRoutes(registry));

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ status: "error", message });
    },
  );

  return app;
}
