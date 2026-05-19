import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate.js";
import { UsersService } from "./users.service.js";
import {
  parseRefreshBody,
  parseRegisterSignInBody,
} from "./users.validation.js";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "./users.errors.js";

export class UsersController {
  constructor(private readonly service = new UsersService()) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = parseRegisterSignInBody(req.body);
      const result = await this.service.register(input);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  signIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input = parseRegisterSignInBody(req.body);
      const result = await this.service.signIn(input);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken } = parseRefreshBody(req.body);
      const result = await this.service.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      this.handleError(error, next);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { auth } = req as AuthenticatedRequest;
      await this.service.logout(auth.userId, auth.deviceId);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, next);
    }
  };

  private handleError(error: unknown, next: NextFunction): void {
    if (error instanceof ValidationError) {
      next(Object.assign(error, { statusCode: 400 }));
      return;
    }
    if (error instanceof ConflictError) {
      next(Object.assign(error, { statusCode: 409 }));
      return;
    }
    if (error instanceof UnauthorizedError) {
      next(Object.assign(error, { statusCode: 401 }));
      return;
    }
    next(error);
  }
}
