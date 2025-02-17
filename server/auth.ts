import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { generateTokens, verifyRefreshToken, requireAuth, requireAdmin, createRefreshToken } from "./jwt";
import rateLimit from "express-rate-limit";

const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Rate limiting middleware
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: "Too many login attempts, please try again later"
  });

  app.post("/api/admin/login", loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { accessToken } = generateTokens(user.id, user.role);
      const refreshToken = await createRefreshToken(user.id, user.role);

      res.json({ 
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", requireAuth, async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        await storage.deleteSession(refreshToken);
      }
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const session = await storage.getValidSession(refreshToken);
      if (!session) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const payload = await verifyRefreshToken(refreshToken);
      const user = await storage.getUser(payload.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { accessToken } = generateTokens(user.id, user.role);
      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  // Example protected admin route
  app.get("/api/admin/protected", requireAdmin, (req, res) => {
    res.json({ message: "Admin access granted", user: req.user });
  });
}