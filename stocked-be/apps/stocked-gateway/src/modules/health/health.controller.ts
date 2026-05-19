import type { Request, Response, NextFunction } from "express";
import { HealthService } from "./health.service.js";

export class HealthController {
  constructor(private readonly service = new HealthService()) {}

  getHealth = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.check();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
