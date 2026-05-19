import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate.js";
import { AlertsService } from "./alerts.service.js";
import { NotFoundError, ValidationError } from "./alerts.errors.js";
import {
  parseCreateBody,
  parseIdParam,
  parseListQuery,
  parseUpdateBody,
} from "./alerts.validation.js";

export class AlertsController {
  constructor(private readonly service = new AlertsService()) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const { includeInactive } = parseListQuery(req.query);
      const result = await this.service.listAlerts(userId, includeInactive);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const id = parseIdParam(req.params);
      const result = await this.service.getAlert(userId, id);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const input = parseCreateBody(req.body);
      const result = await this.service.createAlert(userId, input);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const id = parseIdParam(req.params);
      const input = parseUpdateBody(req.body);
      const result = await this.service.updateAlert(userId, id, input);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const id = parseIdParam(req.params);
      const result = await this.service.deleteAlert(userId, id);
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
    next(error);
  }
}
