import { IStorage } from "./types";
import { InsertUser, User, Strategy, Competitor } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private strategies: Map<number, Strategy>;
  private competitors: Map<number, Competitor>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.strategies = new Map();
    this.competitors = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStrategies(userId: number): Promise<Strategy[]> {
    return Array.from(this.strategies.values()).filter(s => s.user_id === userId);
  }

  async createStrategy(strategy: Omit<Strategy, "id">): Promise<Strategy> {
    const id = this.currentId++;
    const newStrategy = { ...strategy, id };
    this.strategies.set(id, newStrategy);
    return newStrategy;
  }

  async getCompetitors(userId: number): Promise<Competitor[]> {
    return Array.from(this.competitors.values()).filter(c => c.user_id === userId);
  }

  async createCompetitor(competitor: Omit<Competitor, "id">): Promise<Competitor> {
    const id = this.currentId++;
    const newCompetitor = { ...competitor, id };
    this.competitors.set(id, newCompetitor);
    return newCompetitor;
  }
}

export const storage = new MemStorage();
