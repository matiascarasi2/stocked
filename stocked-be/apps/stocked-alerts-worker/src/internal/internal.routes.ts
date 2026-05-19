import { Router, type Request, type Response, type NextFunction } from "express";
import type { SymbolRegistry } from "../symbols/symbol-registry.js";
import { requireInternalSecret } from "./internal-auth.js";

type SyncBody = {
  symbol?: string;
};

export function createInternalRoutes(registry: SymbolRegistry): Router {
  const router = Router();

  router.use(requireInternalSecret);

  router.post(
    "/symbols/sync",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const body = req.body as SyncBody;
        if (!body.symbol || typeof body.symbol !== "string") {
          res.status(400).json({
            status: "error",
            message: "symbol is required",
          });
          return;
        }

        await registry.syncSymbol(body.symbol);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
