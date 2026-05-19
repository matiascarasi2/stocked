import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { AlertsController } from "./alerts.controller.js";

export function createAlertsRoutes(): Router {
  const router = Router();
  const controller = new AlertsController();

  router.use(authenticate);

  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
