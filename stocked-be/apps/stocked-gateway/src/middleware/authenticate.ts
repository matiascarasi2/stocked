import type { Request, Response, NextFunction } from "express";
import { prisma } from "@stocked/schema";
import { verifyAccessToken } from "../lib/tokens.js";

export type AuthenticatedRequest = Request & {
  auth: {
    userId: string;
    deviceId: string;
    sessionId: string;
  };
};

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, tokenVersion: true },
    });

    if (!user || user.tokenVersion !== payload.tv) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    (req as AuthenticatedRequest).auth = {
      userId: payload.sub,
      deviceId: payload.deviceId,
      sessionId: payload.sessionId,
    };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
