import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { StocksController } from "./stocks.controller.js";

export function createStocksRoutes(): Router {
  const router = Router();
  const controller = new StocksController();

  router.use(authenticate);

  router.get("/popular", controller.listPopular);
  router.get("/watched", controller.listWatched);
  router.get("/", controller.search);
  router.get("/:symbol/chart", controller.getChart);
  router.get("/:symbol", controller.getBySymbol);

  return router;
}
