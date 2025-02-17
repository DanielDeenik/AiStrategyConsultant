import { IStorage } from "./types";
import { InsertUser, User, Strategy, Competitor, Session, users, strategies, competitors, sessions } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, gt } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      })
      .returning();
    return session;
  }

  async getValidSession(refreshToken: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refresh_token, refreshToken))
      .where(gt(sessions.expires_at, new Date()));
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
}

export const storage = new DatabaseStorage();