import { User, InsertUser, Strategy, Competitor } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStrategies(userId: number): Promise<Strategy[]>;
  createStrategy(strategy: Omit<Strategy, "id">): Promise<Strategy>;
  getCompetitors(userId: number): Promise<Competitor[]>;
  createCompetitor(competitor: Omit<Competitor, "id">): Promise<Competitor>;
}
