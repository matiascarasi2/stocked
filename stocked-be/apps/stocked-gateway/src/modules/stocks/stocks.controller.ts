import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate.js";
import { StocksService } from "./stocks.service.js";
import {
  NotFoundError,
  UpstreamError,
  ValidationError,
} from "./stocks.errors.js";
import {
  parseChartQuery,
  parseSearchStocksQuery,
  parseSymbolParam,
} from "./stocks.validation.js";

export class StocksController {
  constructor(private readonly service = new StocksService()) {}

  listWatched = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await this.service.listWatchedStocks(userId);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  listPopular = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.listPopularStocks();
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  search = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { q } = parseSearchStocksQuery(req.query);
      const result = await this.service.searchStocks(q);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  getBySymbol = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const symbol = parseSymbolParam(req.params);
      const result = await this.service.getStock(symbol);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  getChart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const symbol = parseSymbolParam(req.params);
      const { range } = parseChartQuery(req.query);
      const result = await this.service.getStockChart(symbol, range);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  private handleError(error: unknown, next: NextFunction): void {
    if (error instanceof ValidationError) {
      next(Object.assign(error, { statusCode: 400 }));
      return;
    }
    if (error instanceof NotFoundError) {
      next(Object.assign(error, { statusCode: 404 }));
      return;
    }
    if (error instanceof UpstreamError) {
      next(Object.assign(error, { statusCode: 502 }));
      return;
    }
    next(error);
  }
}
