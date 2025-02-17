import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateStrategy, analyzeCompetitor } from "./openai";
import { insertStrategySchema, insertCompetitorSchema } from "@shared/schema";
import { requireAuth } from "./jwt";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/strategies", requireAuth, async (req, res) => {
    const strategies = await storage.getStrategies(req.user.id);
    res.json(strategies);
  });

  app.post("/api/strategies/generate", requireAuth, async (req, res) => {
    const { prompt } = req.body;
    const strategy = await generateStrategy(prompt);
    const result = await storage.createStrategy({
      ...strategy,
      user_id: req.user.id,
      created_at: new Date(),
    });
    res.json(result);
  });

  app.get("/api/competitors", requireAuth, async (req, res) => {
    const competitors = await storage.getCompetitors(req.user.id);
    res.json(competitors);
  });

  app.post("/api/competitors/analyze", requireAuth, async (req, res) => {
    const { name } = req.body;
    const analysis = await analyzeCompetitor(name);
    const result = await storage.createCompetitor({
      name,
      ...analysis,
      user_id: req.user.id,
    });
    res.json(result);
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    res.json(req.user);
  });

  const httpServer = createServer(app);
  return httpServer;
}