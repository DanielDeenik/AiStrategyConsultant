import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateStrategy, analyzeCompetitor } from "./openai";
import { insertStrategySchema, insertCompetitorSchema } from "@shared/schema";
import { requireAuth } from "./jwt";
import { aiAnalysisService } from "./services/ai-analysis";
import { strategyConfidenceService } from "./services/strategy-confidence";
import { growthPlaybookService } from "./services/growth-playbook";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/strategies", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const strategies = await storage.getStrategies(req.user.id);
    res.json(strategies);
  });

  app.post("/api/strategies/generate", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
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
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const competitors = await storage.getCompetitors(req.user.id);
    res.json(competitors);
  });

  app.post("/api/competitors/analyze", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    const analysis = await analyzeCompetitor(name);
    const result = await storage.createCompetitor({
      name,
      ...analysis,
      user_id: req.user.id,
    });
    res.json(result);
  });

  // New AI Analysis Routes
  app.post("/api/analysis/virality", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, marketContext } = req.body;
      const viralityMetrics = await aiAnalysisService.analyzeViralityPotential(
        strategy,
        marketContext
      );

      const result = await storage.createViralityScore({
        ...viralityMetrics,
        strategy_id: req.body.strategy_id,
        created_at: new Date(),
      });

      res.json(result);
    } catch (error) {
      console.error("Error analyzing virality:", error);
      res.status(500).json({ message: "Failed to analyze virality potential" });
    }
  });

  app.post("/api/analysis/competitive", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, competitor, marketData } = req.body;
      const competitiveMetrics = await aiAnalysisService.analyzeCompetitivePosition(
        strategy,
        competitor,
        marketData
      );

      const result = await storage.createCompetitiveAnalysis({
        ...competitiveMetrics,
        strategy_id: req.body.strategy_id,
        competitor_id: req.body.competitor_id,
        analyzed_at: new Date(),
      });

      res.json(result);
    } catch (error) {
      console.error("Error analyzing competitive position:", error);
      res.status(500).json({ message: "Failed to analyze competitive position" });
    }
  });

  app.get("/api/analysis/virality/:strategyId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const score = await storage.getViralityScoreByStrategy(strategyId);
      if (!score) {
        return res.status(404).json({ message: "Virality score not found" });
      }
      res.json(score);
    } catch (error) {
      console.error("Error fetching virality score:", error);
      res.status(500).json({ message: "Failed to fetch virality score" });
    }
  });

  app.get("/api/analysis/competitive/:strategyId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const analyses = await storage.getCompetitiveAnalysisByStrategy(strategyId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching competitive analyses:", error);
      res.status(500).json({ message: "Failed to fetch competitive analyses" });
    }
  });

  app.get("/api/market-trends", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const trends = await storage.getRecentMarketTrends(limit);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching market trends:", error);
      res.status(500).json({ message: "Failed to fetch market trends" });
    }
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });

  app.post("/api/strategy/confidence-score", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, marketData, competitorData, historicalData, strategyId } = req.body;

      const confidenceMetrics = await strategyConfidenceService.calculateConfidence(
        strategy,
        marketData,
        competitorData,
        historicalData
      );

      // Convert numeric values to strings for database storage
      const result = await storage.createStrategyConfidence({
        ...confidenceMetrics,
        strategy_id: strategyId,
        confidence_score: confidenceMetrics.confidence_score.toString(),
        market_alignment: confidenceMetrics.market_alignment.toString(),
        competitor_benchmark: confidenceMetrics.competitor_benchmark.toString(),
        historical_success: confidenceMetrics.historical_success.toString(),
        calculated_at: new Date(),
      });

      res.json(result);
    } catch (error) {
      console.error("Error calculating strategy confidence:", error);
      res.status(500).json({ message: "Failed to calculate strategy confidence" });
    }
  });

  app.get("/api/strategy/:strategyId/confidence", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const confidence = await storage.getStrategyConfidence(strategyId);
      if (!confidence) {
        return res.status(404).json({ message: "Strategy confidence not found" });
      }
      res.json(confidence);
    } catch (error) {
      console.error("Error fetching strategy confidence:", error);
      res.status(500).json({ message: "Failed to fetch strategy confidence" });
    }
  });

  app.get("/api/strategy/:strategyId/confidence/history", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const history = await storage.getHistoricalConfidence(strategyId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching confidence history:", error);
      res.status(500).json({ message: "Failed to fetch confidence history" });
    }
  });

  app.post("/api/strategy/growth-playbook", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, marketData, competitorData, industryContext, strategyId } = req.body;

      const playbook = await growthPlaybookService.generatePlaybook(
        strategy,
        marketData,
        competitorData,
        industryContext
      );

      const result = await storage.createGrowthPlaybook({
        ...playbook,
        strategy_id: strategyId,
        user_id: req.user.id,
        scheduled_for: null,
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating growth playbook:", error);
      res.status(500).json({ message: "Failed to generate growth playbook" });
    }
  });

  app.post("/api/strategy/schedule-playbook", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategyId, scheduledFor } = req.body;
      await growthPlaybookService.schedulePlaybookGeneration(
        strategyId,
        req.user.id,
        new Date(scheduledFor)
      );
      res.json({ message: "Playbook generation scheduled successfully" });
    } catch (error) {
      console.error("Error scheduling playbook:", error);
      res.status(500).json({ message: "Failed to schedule playbook generation" });
    }
  });

  app.get("/api/strategy/:strategyId/playbooks", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const playbooks = await storage.getPlaybooksByStrategy(strategyId);
      res.json(playbooks);
    } catch (error) {
      console.error("Error fetching playbooks:", error);
      res.status(500).json({ message: "Failed to fetch playbooks" });
    }
  });

  app.get("/api/strategy/scheduled-playbooks", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const playbooks = await storage.getScheduledPlaybooks(req.user.id);
      res.json(playbooks);
    } catch (error) {
      console.error("Error fetching scheduled playbooks:", error);
      res.status(500).json({ message: "Failed to fetch scheduled playbooks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}