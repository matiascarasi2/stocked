import cors from "cors";
import express, { type Express } from "express";
import { createHealthRoutes } from "./modules/health/health.routes.js";
import { createUsersRoutes } from "./modules/users/users.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", createHealthRoutes());
  app.use("/users", createUsersRoutes());

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(error);
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? Number(error.statusCode)
          : 503;
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(statusCode).json({
        status: "error",
        message,
      });
    },
  );

  return app;
}
