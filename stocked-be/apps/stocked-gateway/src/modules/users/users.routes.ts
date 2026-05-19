import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { UsersController } from "./users.controller.js";

export function createUsersRoutes(): Router {
  const router = Router();
  const controller = new UsersController();

  router.post("/register", controller.register);
  router.post("/sign-in", controller.signIn);
  router.post("/refresh", controller.refresh);
  router.post("/logout", authenticate, controller.logout);

  return router;
}
