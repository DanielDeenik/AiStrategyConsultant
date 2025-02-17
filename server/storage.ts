import { IStorage } from "./types";
import {
  InsertUser, User, Strategy, Competitor, Session,
  users, strategies, competitors, sessions,
  viralityScores, marketTrends, competitiveAnalysis,
  ViralityScore, MarketTrend, CompetitiveAnalysis,
  strategyConfidence, type StrategyConfidence
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, gt, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import {
  growthPlaybooks,
  type GrowthPlaybook,
  type InsertGrowthPlaybook,
} from "@shared/schema";
import {
  automationTasks,
  toolIntegrations,
  kpiMetrics,
  type AutomationTask,
  type InsertAutomationTask,
  type ToolIntegration,
  type InsertToolIntegration,
  type KpiMetric,
  type InsertKpiMetric,
} from "@shared/schema";
import {
  decisionSimulations,
  simulationScenarios,
  type DecisionSimulation,
  type InsertDecisionSimulation,
  type SimulationScenario,
  type InsertSimulationScenario,
} from "@shared/schema";
import { type ApiKey, type InsertApiKey, apiKeys } from "@shared/schema";


const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session> {
    try {
      const [session] = await db
        .insert(sessions)
        .values({
          user_id: userId,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        })
        .returning();
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  async getValidSession(refreshToken: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refresh_token, refreshToken),
          gt(sessions.expires_at, new Date())
        )
      );
    return session;
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await db
      .delete(sessions)
      .where(eq(sessions.refresh_token, refreshToken));
  }

  async getStrategies(userId: number): Promise<Strategy[]> {
    return db.select().from(strategies).where(eq(strategies.user_id, userId));
  }

  async createStrategy(strategy: Omit<Strategy, "id">): Promise<Strategy> {
    const [newStrategy] = await db.insert(strategies).values(strategy).returning();
    return newStrategy;
  }

  async getCompetitors(userId: number): Promise<Competitor[]> {
    return db.select().from(competitors).where(eq(competitors.user_id, userId));
  }

  async createCompetitor(competitor: Omit<Competitor, "id">): Promise<Competitor> {
    const [newCompetitor] = await db.insert(competitors).values(competitor).returning();
    return newCompetitor;
  }

  async createViralityScore(score: Omit<ViralityScore, "id">): Promise<ViralityScore> {
    const [newScore] = await db.insert(viralityScores).values(score).returning();
    return newScore;
  }

  async getViralityScoreByStrategy(strategyId: number): Promise<ViralityScore | undefined> {
    const [score] = await db
      .select()
      .from(viralityScores)
      .where(eq(viralityScores.strategy_id, strategyId));
    return score;
  }

  async createMarketTrend(trend: Omit<MarketTrend, "id">): Promise<MarketTrend> {
    const [newTrend] = await db.insert(marketTrends).values(trend).returning();
    return newTrend;
  }

  async getRecentMarketTrends(limit: number = 10): Promise<MarketTrend[]> {
    return db
      .select()
      .from(marketTrends)
      .orderBy(marketTrends.captured_at)
      .limit(limit);
  }

  async createCompetitiveAnalysis(analysis: Omit<CompetitiveAnalysis, "id">): Promise<CompetitiveAnalysis> {
    const [newAnalysis] = await db.insert(competitiveAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async getCompetitiveAnalysisByStrategy(strategyId: number): Promise<CompetitiveAnalysis[]> {
    return db
      .select()
      .from(competitiveAnalysis)
      .where(eq(competitiveAnalysis.strategy_id, strategyId));
  }

  async createStrategyConfidence(confidence: Omit<StrategyConfidence, "id">): Promise<StrategyConfidence> {
    const [newConfidence] = await db.insert(strategyConfidence).values(confidence).returning();
    return newConfidence;
  }

  async getStrategyConfidence(strategyId: number): Promise<StrategyConfidence | undefined> {
    const [confidence] = await db
      .select()
      .from(strategyConfidence)
      .where(eq(strategyConfidence.strategy_id, strategyId))
      .orderBy(strategyConfidence.calculated_at)
      .limit(1);
    return confidence;
  }

  async getHistoricalConfidence(strategyId: number): Promise<StrategyConfidence[]> {
    return db
      .select()
      .from(strategyConfidence)
      .where(eq(strategyConfidence.strategy_id, strategyId))
      .orderBy(strategyConfidence.calculated_at);
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
    return strategy;
  }

  async createGrowthPlaybook(playbook: InsertGrowthPlaybook): Promise<GrowthPlaybook> {
    const [newPlaybook] = await db.insert(growthPlaybooks).values(playbook).returning();
    return newPlaybook;
  }

  async getGrowthPlaybook(id: number): Promise<GrowthPlaybook | undefined> {
    const [playbook] = await db
      .select()
      .from(growthPlaybooks)
      .where(eq(growthPlaybooks.id, id));
    return playbook;
  }

  async getPlaybooksByStrategy(strategyId: number): Promise<GrowthPlaybook[]> {
    return db
      .select()
      .from(growthPlaybooks)
      .where(eq(growthPlaybooks.strategy_id, strategyId))
      .orderBy(growthPlaybooks.generated_at);
  }

  async getScheduledPlaybooks(userId: number): Promise<GrowthPlaybook[]> {
    return db
      .select()
      .from(growthPlaybooks)
      .where(
        and(
          eq(growthPlaybooks.user_id, userId),
          gt(growthPlaybooks.scheduled_for, new Date())
        )
      )
      .orderBy(growthPlaybooks.scheduled_for);
  }

  // Automation Tasks
  async createAutomationTask(task: InsertAutomationTask): Promise<AutomationTask> {
    const [newTask] = await db.insert(automationTasks).values(task).returning();
    return newTask;
  }

  async getAutomationTasks(userId: number): Promise<AutomationTask[]> {
    return db
      .select()
      .from(automationTasks)
      .where(eq(automationTasks.user_id, userId))
      .orderBy(automationTasks.created_at);
  }

  async updateTaskStatus(taskId: number, status: string): Promise<AutomationTask> {
    const [updatedTask] = await db
      .update(automationTasks)
      .set({ status, completed_at: status === 'completed' ? new Date() : null })
      .where(eq(automationTasks.id, taskId))
      .returning();
    return updatedTask;
  }

  // Tool Integrations
  async createToolIntegration(integration: InsertToolIntegration): Promise<ToolIntegration> {
    const [newIntegration] = await db.insert(toolIntegrations).values(integration).returning();
    return newIntegration;
  }

  async getToolIntegrations(userId: number): Promise<ToolIntegration[]> {
    return db
      .select()
      .from(toolIntegrations)
      .where(eq(toolIntegrations.user_id, userId));
  }

  // KPI Metrics
  async createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric> {
    const [newMetric] = await db.insert(kpiMetrics).values(metric).returning();
    return newMetric;
  }

  async getKpiMetrics(strategyId: number): Promise<KpiMetric[]> {
    return db
      .select()
      .from(kpiMetrics)
      .where(eq(kpiMetrics.strategy_id, strategyId))
      .orderBy(kpiMetrics.last_updated);
  }

  async updateKpiMetric(metricId: number, currentValue: string, status: string): Promise<KpiMetric> {
    const [updatedMetric] = await db
      .update(kpiMetrics)
      .set({ current_value: currentValue, status, last_updated: new Date() })
      .where(eq(kpiMetrics.id, metricId))
      .returning();
    return updatedMetric;
  }

  // Decision Simulations
  async createDecisionSimulation(simulation: InsertDecisionSimulation): Promise<DecisionSimulation> {
    const [newSimulation] = await db.insert(decisionSimulations).values(simulation).returning();
    return newSimulation;
  }

  async getSimulation(id: number): Promise<DecisionSimulation | undefined> {
    const [simulation] = await db
      .select()
      .from(decisionSimulations)
      .where(eq(decisionSimulations.id, id));
    return simulation;
  }

  async getSimulationsByStrategy(strategyId: number): Promise<DecisionSimulation[]> {
    return db
      .select()
      .from(decisionSimulations)
      .where(eq(decisionSimulations.strategy_id, strategyId))
      .orderBy(decisionSimulations.created_at);
  }

  async updateSimulationStatus(
    simulationId: number,
    status: "pending" | "running" | "completed" | "failed"
  ): Promise<DecisionSimulation> {
    const [updatedSimulation] = await db
      .update(decisionSimulations)
      .set({
        status,
        completed_at: status === "completed" ? new Date() : null,
      })
      .where(eq(decisionSimulations.id, simulationId))
      .returning();
    return updatedSimulation;
  }

  async createSimulationScenario(scenario: InsertSimulationScenario): Promise<SimulationScenario> {
    const [newScenario] = await db.insert(simulationScenarios).values(scenario).returning();
    return newScenario;
  }

  async getSimulationScenarios(simulationId: number): Promise<SimulationScenario[]> {
    return db
      .select()
      .from(simulationScenarios)
      .where(eq(simulationScenarios.simulation_id, simulationId))
      .orderBy(simulationScenarios.created_at);
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [newKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newKey;
  }

  async getApiKeys(userId: number): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.user_id, userId))
      .where(eq(apiKeys.is_active, true))
      .orderBy(apiKeys.created_at);
  }

  async revokeApiKey(keyId: number): Promise<void> {
    await db
      .update(apiKeys)
      .set({ is_active: false })
      .where(eq(apiKeys.id, keyId));
  }

  async validateApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, key))
      .where(eq(apiKeys.is_active, true));
    return apiKey;
  }
}

export const storage = new DatabaseStorage();