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
import { executionAutomationService } from "./services/execution-automation";
import { decisionSimulationService } from "./services/decision-simulation";
import { randomBytes } from "crypto";
import { presuasionAnalysisService } from "./services/pre-suasion-analysis";
import { marketTrendsService } from "./services/market-trends";
import multer from "multer";
import { extname } from "path";
import * as openai from 'openai';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.csv', '.json', '.xlsx', '.xls'];
    const ext = extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

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

  // Execution Automation Routes
  app.post("/api/execution/automation/tasks", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, marketContext, selectedTools, strategyId } = req.body;

      const tasks = await executionAutomationService.generateAutomationTasks(
        strategy,
        marketContext,
        selectedTools
      );

      const createdTasks = await Promise.all(
        tasks.map(async (taskDetails) => {
          const task = await executionAutomationService.createAutomationTask(
            taskDetails,
            strategyId,
            req.user!.id
          );
          return storage.createAutomationTask(task);
        })
      );

      res.json(createdTasks);
    } catch (error) {
      console.error("Error generating automation tasks:", error);
      res.status(500).json({ message: "Failed to generate automation tasks" });
    }
  });

  app.get("/api/execution/automation/tasks", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const tasks = await storage.getAutomationTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching automation tasks:", error);
      res.status(500).json({ message: "Failed to fetch automation tasks" });
    }
  });

  app.post("/api/execution/kpi/targets", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { strategy, marketData, historicalPerformance, strategyId } = req.body;

      const kpiTargets = await executionAutomationService.generateKPITargets(
        strategy,
        marketData,
        historicalPerformance
      );

      const createdMetrics = await Promise.all(
        kpiTargets.map(async (kpiTarget) => {
          const metric = await executionAutomationService.createKPIMetric(
            kpiTarget,
            strategyId,
            req.user!.id
          );
          return storage.createKpiMetric(metric);
        })
      );

      res.json(createdMetrics);
    } catch (error) {
      console.error("Error generating KPI targets:", error);
      res.status(500).json({ message: "Failed to generate KPI targets" });
    }
  });

  app.get("/api/execution/kpi/:strategyId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const metrics = await storage.getKpiMetrics(strategyId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching KPI metrics:", error);
      res.status(500).json({ message: "Failed to fetch KPI metrics" });
    }
  });

  app.post("/api/execution/kpi/:metricId/update", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const metricId = parseInt(req.params.metricId);
      const { currentValue, status } = req.body;
      const updatedMetric = await storage.updateKpiMetric(metricId, currentValue, status);
      res.json(updatedMetric);
    } catch (error) {
      console.error("Error updating KPI metric:", error);
      res.status(500).json({ message: "Failed to update KPI metric" });
    }
  });

  // Decision Simulation Routes
  app.post("/api/decision/simulator", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const {
        strategyId,
        title,
        description,
        parameters,
        iterations,
      } = req.body;

      await decisionSimulationService.createSimulation(
        strategyId,
        req.user.id,
        title,
        description,
        parameters,
        iterations
      );

      res.json({ message: "Simulation created successfully" });
    } catch (error) {
      console.error("Error creating simulation:", error);
      res.status(500).json({ message: "Failed to create simulation" });
    }
  });

  app.get("/api/decision/simulations/:strategyId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const strategyId = parseInt(req.params.strategyId);
      const simulations = await storage.getSimulationsByStrategy(strategyId);
      res.json(simulations);
    } catch (error) {
      console.error("Error fetching simulations:", error);
      res.status(500).json({ message: "Failed to fetch simulations" });
    }
  });

  app.get("/api/decision/simulation/:simulationId/scenarios", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const simulationId = parseInt(req.params.simulationId);
      const scenarios = await storage.getSimulationScenarios(simulationId);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  //NEW API Key routes
  app.get("/api/keys", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const keys = await storage.getApiKeys(req.user.id);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/keys", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { name, scopes } = req.body;
      const key = `sk_${randomBytes(32).toString("hex")}`;

      const apiKey = await storage.createApiKey({
        user_id: req.user.id,
        key,
        name,
        scopes,
        expires_at: null, // Optional: Set an expiration date if needed
      });

      res.json({ ...apiKey, key }); // Only return the full key on creation
    } catch (error) {
      console.error("Error generating API key:", error);
      res.status(500).json({ message: "Failed to generate API key" });
    }
  });

  app.delete("/api/keys/:keyId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const keyId = parseInt(req.params.keyId);
      await storage.revokeApiKey(keyId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error revoking API key:", error);
      res.status(500).json({ message: "Failed to revoke API key" });
    }
  });


  // Pre-suasion Analysis Routes
  app.post("/api/market-intelligence/pre-suasion", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { content, contentType, strategyId } = req.body;

      const analysisResult = await presuasionAnalysisService.analyzeContent(
        content,
        contentType
      );

      const score = await storage.createPresuasionScore({
        strategy_id: strategyId,
        content_type: contentType,
        content,
        persuasion_score: analysisResult.persuasion_score.toString(),
        behavioral_insights: analysisResult.behavioral_insights,
        sentiment_analysis: analysisResult.sentiment_analysis,
        conversion_probability: analysisResult.conversion_probability.toString(),
        recommendations: analysisResult.recommendations,
        user_id: req.user.id,
      });

      res.json(score);
    } catch (error) {
      console.error("Error analyzing pre-suasion:", error);
      res.status(500).json({ message: "Failed to analyze pre-suasion" });
    }
  });

  app.get("/api/market-intelligence/pre-suasion/:scoreId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const scoreId = parseInt(req.params.scoreId);
      const score = await storage.getPresuasionScore(scoreId);
      if (!score) {
        return res.status(404).json({ message: "Pre-suasion score not found" });
      }
      res.json(score);
    } catch (error) {
      console.error("Error fetching pre-suasion score:", error);
      res.status(500).json({ message: "Failed to fetch pre-suasion score" });
    }
  });

  app.post("/api/market-intelligence/ab-test", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { content, contentType, presuasionScoreId } = req.body;

      const { variants, predictions } = await presuasionAnalysisService.generateABTestVariants(
        content,
        contentType
      );

      const results = await Promise.all(
        Object.entries(predictions).map(([variant, engagementRate]) =>
          storage.createABTestResult({
            presuasion_score_id: presuasionScoreId,
            variant,
            engagement_rate: engagementRate.toString(),
            conversion_rate: "0", // Initial value, to be updated with actual results
            audience_response: {},
            test_duration: 7, // Default 7-day test duration
          })
        )
      );

      res.json({ variants, predictions, results });
    } catch (error) {
      console.error("Error creating A/B test:", error);
      res.status(500).json({ message: "Failed to create A/B test" });
    }
  });

  app.get("/api/market-intelligence/ab-test/:scoreId", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const scoreId = parseInt(req.params.scoreId);
      const results = await storage.getABTestResults(scoreId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching A/B test results:", error);
      res.status(500).json({ message: "Failed to fetch A/B test results" });
    }
  });

  app.post("/api/market-intelligence/analyze-trend", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { keyword, industryCategory, marketData } = req.body;

      const trendAnalysis = await marketTrendsService.analyzeTrend(
        keyword,
        industryCategory,
        marketData
      );

      const trend = await storage.createMarketTrend({
        keyword,
        trend_score: trendAnalysis.trend_score.toString(),
        sentiment_score: trendAnalysis.sentiment_score.toString(),
        volume: trendAnalysis.volume,
        growth_rate: trendAnalysis.growth_rate.toString(),
        data_source: "AI Analysis",
        industry_impact_score: trendAnalysis.industry_impact_score.toString(),
        venture_capital_interest: trendAnalysis.venture_capital_interest.toString(),
        forecast_confidence: trendAnalysis.forecast_confidence.toString(),
        predicted_peak_date: trendAnalysis.predicted_peak_date,
        ai_insights: trendAnalysis.ai_insights,
        industry_category: industryCategory,
        related_technologies: trendAnalysis.related_technologies,
        captured_at: new Date()
      });

      res.json(trend);
    } catch (error) {
      console.error("Error analyzing market trend:", error);
      res.status(500).json({ message: "Failed to analyze market trend" });
    }
  });

  app.post("/api/market-intelligence/trend-insights", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { trends } = req.body;
      const insights = await marketTrendsService.aggregateTrendInsights(trends);
      res.json(insights);
    } catch (error) {
      console.error("Error generating trend insights:", error);
      res.status(500).json({ message: "Failed to generate trend insights" });
    }
  });

  app.post("/api/market-intelligence/upload", requireAuth, upload.array('files'), async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const results = [];

      for (const file of files) {
        const fileType = extname(file.originalname).toLowerCase();
        const fileContent = file.buffer.toString('utf-8');

        // Send to OpenAI for analysis
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Analyze this market data file and extract key insights. Focus on market trends, competitor movements, and strategic implications. Output in JSON format with the following structure: { insights: string[], marketTrends: string[], competitorMoves: string[], strategicImplications: string[] }",
            },
            {
              role: "user",
              content: `File Type: ${fileType}\nContent: ${fileContent}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        if (!response.choices[0].message.content) {
          throw new Error("No content in OpenAI response");
        }

        const analysisResult = JSON.parse(response.choices[0].message.content);

        results.push({
          filename: file.originalname,
          fileType,
          analysis: analysisResult,
          uploadedAt: new Date(),
        });
      }

      res.json(results);
    } catch (error) {
      console.error("Error processing uploaded files:", error);
      res.status(500).json({ message: "Failed to process uploaded files" });
    }
  });

  // New Integration Routes
  app.post("/api/market-intelligence/integrations/google-drive", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      // Store integration token and details
      await storage.createIntegration({
        user_id: req.user.id,
        service: "google_drive",
        access_token: req.body.access_token,
        refresh_token: req.body.refresh_token,
        expires_at: new Date(Date.now() + req.body.expires_in * 1000),
        created_at: new Date(),
      });

      res.json({ message: "Google Drive integration added successfully" });
    } catch (error) {
      console.error("Error adding Google Drive integration:", error);
      res.status(500).json({ message: "Failed to add Google Drive integration" });
    }
  });

  app.post("/api/market-intelligence/integrations/notion", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      // Store Notion integration details
      await storage.createIntegration({
        user_id: req.user.id,
        service: "notion",
        access_token: req.body.access_token,
        workspace_id: req.body.workspace_id,
        created_at: new Date(),
      });

      res.json({ message: "Notion integration added successfully" });
    } catch (error) {
      console.error("Error adding Notion integration:", error);
      res.status(500).json({ message: "Failed to add Notion integration" });
    }
  });

  app.post("/api/market-intelligence/integrations/salesforce", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      // Store Salesforce integration details
      await storage.createIntegration({
        user_id: req.user.id,
        service: "salesforce",
        access_token: req.body.access_token,
        refresh_token: req.body.refresh_token,
        instance_url: req.body.instance_url,
        created_at: new Date(),
      });

      res.json({ message: "Salesforce integration added successfully" });
    } catch (error) {
      console.error("Error adding Salesforce integration:", error);
      res.status(500).json({ message: "Failed to add Salesforce integration" });
    }
  });

  app.get("/api/market-intelligence/integrations", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const integrations = await storage.getIntegrations(req.user.id);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.delete("/api/market-intelligence/integrations/:id", requireAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await storage.deleteIntegration(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      console.error("Error removing integration:", error);
      res.status(500).json({ message: "Failed to remove integration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}