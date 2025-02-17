import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  refresh_token: text("refresh_token").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  confidence: integer("confidence").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  user_id: integer("user_id").references(() => users.id),
});

export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  strength: text("strength").notNull(),
  weakness: text("weakness").notNull(),
  sentiment: integer("sentiment").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

// New tables for virality and competitive intelligence

export const viralityScores = pgTable("virality_scores", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  social_currency_score: decimal("social_currency_score").notNull(),
  trigger_score: decimal("trigger_score").notNull(),
  emotion_score: decimal("emotion_score").notNull(),
  public_score: decimal("public_score").notNull(),
  practical_value_score: decimal("practical_value_score").notNull(),
  story_score: decimal("story_score").notNull(),
  total_score: decimal("total_score").notNull(),
  confidence: decimal("confidence").notNull(),
  ai_insights: json("ai_insights").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  trend_score: decimal("trend_score").notNull(),
  sentiment_score: decimal("sentiment_score").notNull(),
  volume: integer("volume").notNull(),
  growth_rate: decimal("growth_rate").notNull(),
  data_source: text("data_source").notNull(),
  industry_impact_score: decimal("industry_impact_score").notNull(),
  venture_capital_interest: decimal("venture_capital_interest").notNull(),
  forecast_confidence: decimal("forecast_confidence").notNull(),
  predicted_peak_date: timestamp("predicted_peak_date"),
  ai_insights: json("ai_insights").notNull(),
  industry_category: text("industry_category").notNull(),
  related_technologies: text("related_technologies").array().notNull(),
  captured_at: timestamp("captured_at").defaultNow(),
});

export const competitiveAnalysis = pgTable("competitive_analysis", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  competitor_id: integer("competitor_id").references(() => competitors.id).notNull(),
  market_share: decimal("market_share").notNull(),
  relative_strength: decimal("relative_strength").notNull(),
  threat_level: integer("threat_level").notNull(),
  opportunity_score: decimal("opportunity_score").notNull(),
  ai_recommendations: json("ai_recommendations").notNull(),
  analyzed_at: timestamp("analyzed_at").defaultNow(),
});

export const strategyConfidence = pgTable("strategy_confidence", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  confidence_score: decimal("confidence_score").notNull(),
  market_alignment: decimal("market_alignment").notNull(),
  competitor_benchmark: decimal("competitor_benchmark").notNull(),
  historical_success: decimal("historical_success").notNull(),
  ai_recommendations: json("ai_recommendations").notNull(),
  calculated_at: timestamp("calculated_at").defaultNow(),
});

// New table for growth playbooks
export const growthPlaybooks = pgTable("growth_playbooks", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  market_insights: json("market_insights").notNull(),
  competitor_insights: json("competitor_insights").notNull(),
  growth_tactics: json("growth_tactics").notNull(),
  confidence_score: decimal("confidence_score").notNull(),
  generated_at: timestamp("generated_at").defaultNow(),
  scheduled_for: timestamp("scheduled_for"),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

export const automationTasks = pgTable("automation_tasks", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed", "failed"] }).default("pending").notNull(),
  tool: text("tool", { enum: ["notion", "trello", "slack", "zapier"] }).notNull(),
  action_details: json("action_details").notNull(),
  scheduled_for: timestamp("scheduled_for"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow(),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

export const toolIntegrations = pgTable("tool_integrations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  tool_name: text("tool_name").notNull(),
  access_token: text("access_token").notNull(),
  workspace_id: text("workspace_id"),
  settings: json("settings"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const kpiMetrics = pgTable("kpi_metrics", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  metric_name: text("metric_name").notNull(),
  target_value: decimal("target_value").notNull(),
  current_value: decimal("current_value").notNull(),
  unit: text("unit").notNull(),
  status: text("status", { enum: ["ahead", "on_track", "behind"] }).notNull(),
  last_updated: timestamp("last_updated").defaultNow(),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

// New tables for decision simulations
export const decisionSimulations = pgTable("decision_simulations", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  input_parameters: json("input_parameters").notNull(),
  monte_carlo_iterations: integer("monte_carlo_iterations").notNull(),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending").notNull(),
  results: json("results"),
  confidence_score: decimal("confidence_score"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

export const simulationScenarios = pgTable("simulation_scenarios", {
  id: serial("id").primaryKey(),
  simulation_id: integer("simulation_id").references(() => decisionSimulations.id).notNull(),
  name: text("name").notNull(),
  probability: decimal("probability").notNull(),
  financial_impact: decimal("financial_impact").notNull(),
  market_adoption_rate: decimal("market_adoption_rate").notNull(),
  risk_factors: json("risk_factors").notNull(),
  metrics: json("metrics").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Add new table for API keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  scopes: text("scopes", { enum: ["read", "write", "admin"] }).array().notNull(),
  last_used: timestamp("last_used"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
  is_active: boolean("is_active").default(true).notNull(),
});

// Add schema for inserting API keys
export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  user_id: true,
  key: true,
  name: true,
  scopes: true,
  expires_at: true,
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  role: true,
});

export const insertStrategySchema = createInsertSchema(strategies).pick({
  title: true,
  description: true,
  type: true,
  confidence: true,
  user_id: true,
});

export const insertCompetitorSchema = createInsertSchema(competitors).pick({
  name: true,
  strength: true,
  weakness: true,
  sentiment: true,
  user_id: true,
});

// Add schema for inserting virality scores
export const insertViralityScoreSchema = createInsertSchema(viralityScores).pick({
  strategy_id: true,
  social_currency_score: true,
  trigger_score: true,
  emotion_score: true,
  public_score: true,
  practical_value_score: true,
  story_score: true,
  total_score: true,
  confidence: true,
  ai_insights: true,
});

export const insertMarketTrendSchema = createInsertSchema(marketTrends).pick({
  keyword: true,
  trend_score: true,
  sentiment_score: true,
  volume: true,
  growth_rate: true,
  data_source: true,
  industry_impact_score: true,
  venture_capital_interest: true,
  forecast_confidence: true,
  predicted_peak_date: true,
  ai_insights: true,
  industry_category: true,
  related_technologies: true,
});

export const insertCompetitiveAnalysisSchema = createInsertSchema(competitiveAnalysis).pick({
  strategy_id: true,
  competitor_id: true,
  market_share: true,
  relative_strength: true,
  threat_level: true,
  opportunity_score: true,
  ai_recommendations: true,
});

export const insertStrategyConfidenceSchema = createInsertSchema(strategyConfidence).pick({
  strategy_id: true,
  confidence_score: true,
  market_alignment: true,
  competitor_benchmark: true,
  historical_success: true,
  ai_recommendations: true,
});

export const insertGrowthPlaybookSchema = createInsertSchema(growthPlaybooks).pick({
  strategy_id: true,
  title: true,
  description: true,
  market_insights: true,
  competitor_insights: true,
  growth_tactics: true,
  confidence_score: true,
  scheduled_for: true,
  user_id: true,
});

// Add schemas for inserting data
export const insertAutomationTaskSchema = createInsertSchema(automationTasks).pick({
  strategy_id: true,
  title: true,
  description: true,
  tool: true,
  action_details: true,
  scheduled_for: true,
  user_id: true,
});

export const insertToolIntegrationSchema = createInsertSchema(toolIntegrations).pick({
  user_id: true,
  tool_name: true,
  access_token: true,
  workspace_id: true,
  settings: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).pick({
  strategy_id: true,
  metric_name: true,
  target_value: true,
  current_value: true,
  unit: true,
  status: true,
  user_id: true,
});


export const insertDecisionSimulationSchema = createInsertSchema(decisionSimulations).pick({
  strategy_id: true,
  title: true,
  description: true,
  input_parameters: true,
  monte_carlo_iterations: true,
  user_id: true,
});

export const insertSimulationScenarioSchema = createInsertSchema(simulationScenarios).pick({
  simulation_id: true,
  name: true,
  probability: true,
  financial_impact: true,
  market_adoption_rate: true,
  risk_factors: true,
  metrics: true,
});

// Add new tables for pre-suasion analytics
export const presuasionScores = pgTable("presuasion_scores", {
  id: serial("id").primaryKey(),
  strategy_id: integer("strategy_id").references(() => strategies.id).notNull(),
  content_type: text("content_type", { enum: ["text", "image", "video", "campaign"] }).notNull(),
  content: text("content").notNull(),
  persuasion_score: decimal("persuasion_score").notNull(),
  behavioral_insights: json("behavioral_insights").notNull(),
  sentiment_analysis: json("sentiment_analysis").notNull(),
  conversion_probability: decimal("conversion_probability").notNull(),
  recommendations: json("recommendations").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

export const abTestResults = pgTable("ab_test_results", {
  id: serial("id").primaryKey(),
  presuasion_score_id: integer("presuasion_score_id").references(() => presuasionScores.id).notNull(),
  variant: text("variant").notNull(),
  engagement_rate: decimal("engagement_rate").notNull(),
  conversion_rate: decimal("conversion_rate").notNull(),
  audience_response: json("audience_response").notNull(),
  test_duration: integer("test_duration").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Add schemas for inserting data
export const insertPresuasionScoreSchema = createInsertSchema(presuasionScores).pick({
  strategy_id: true,
  content_type: true,
  content: true,
  persuasion_score: true,
  behavioral_insights: true,
  sentiment_analysis: true,
  conversion_probability: true,
  recommendations: true,
  user_id: true,
});

export const insertABTestResultSchema = createInsertSchema(abTestResults).pick({
  presuasion_score_id: true,
  variant: true,
  engagement_rate: true,
  conversion_rate: true,
  audience_response: true,
  test_duration: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Strategy = typeof strategies.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ViralityScore = typeof viralityScores.$inferSelect;
export type MarketTrend = typeof marketTrends.$inferSelect;
export type CompetitiveAnalysis = typeof competitiveAnalysis.$inferSelect;
export type StrategyConfidence = typeof strategyConfidence.$inferSelect;
export type InsertStrategyConfidence = z.infer<typeof insertStrategyConfidenceSchema>;
export type GrowthPlaybook = typeof growthPlaybooks.$inferSelect;
export type InsertGrowthPlaybook = z.infer<typeof insertGrowthPlaybookSchema>;
export type AutomationTask = typeof automationTasks.$inferSelect;
export type InsertAutomationTask = z.infer<typeof insertAutomationTaskSchema>;
export type ToolIntegration = typeof toolIntegrations.$inferSelect;
export type InsertToolIntegration = z.infer<typeof insertToolIntegrationSchema>;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type DecisionSimulation = typeof decisionSimulations.$inferSelect;
export type InsertDecisionSimulation = z.infer<typeof insertDecisionSimulationSchema>;
export type SimulationScenario = typeof simulationScenarios.$inferSelect;
export type InsertSimulationScenario = z.infer<typeof insertSimulationScenarioSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type PresuasionScore = typeof presuasionScores.$inferSelect;
export type InsertPresuasionScore = z.infer<typeof insertPresuasionScoreSchema>;
export type ABTestResult = typeof abTestResults.$inferSelect;
export type InsertABTestResult = z.infer<typeof insertABTestResultSchema>;
export type InsertViralityScore = z.infer<typeof insertViralityScoreSchema>;
export type InsertMarketTrend = z.infer<typeof insertMarketTrendSchema>;
export type InsertCompetitiveAnalysis = z.infer<typeof insertCompetitiveAnalysisSchema>;