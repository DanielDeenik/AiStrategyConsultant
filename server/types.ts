import { User, InsertUser, Strategy, Competitor, Session } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session>;
  getValidSession(refreshToken: string): Promise<Session | undefined>;
  deleteSession(refreshToken: string): Promise<void>;
  getStrategies(userId: number): Promise<Strategy[]>;
  createStrategy(strategy: Omit<Strategy, "id">): Promise<Strategy>;
  getCompetitors(userId: number): Promise<Competitor[]>;
  createCompetitor(competitor: Omit<Competitor, "id">): Promise<Competitor>;
}