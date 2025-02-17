import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";

export interface JWTPayload {
  userId: number;
  role: string;
}

export function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyAccessToken(token);
    
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    await requireAuth(req, res, () => {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
}

export async function createRefreshToken(userId: number, role: string): Promise<string> {
  const { refreshToken } = generateTokens(userId, role);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await storage.createSession(userId, refreshToken, expiresAt);
  return refreshToken;
}
