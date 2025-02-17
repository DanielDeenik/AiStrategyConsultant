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
}

export const storage = new DatabaseStorage();