import { Router } from "express";
import { HealthController } from "./health.controller.js";

export function createHealthRoutes(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get("/", controller.getHealth);

  return router;
}
