import type { Request, Response, NextFunction } from "express";
import { env } from "../lib/env.js";

export function requireInternalSecret(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const secret = req.header("x-internal-secret");
  if (!secret || secret !== env.internalSecret) {
    res.status(401).json({ status: "error", message: "Unauthorized" });
    return;
  }
  next();
}
