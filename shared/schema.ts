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

export const insertStrategyConfidenceSchema = createInsertSchema(strategyConfidence).pick({
  strategy_id: true,
  confidence_score: true,
  market_alignment: true,
  competitor_benchmark: true,
  historical_success: true,
  ai_recommendations: true,
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