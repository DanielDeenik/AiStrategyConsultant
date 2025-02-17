import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Strategy = typeof strategies.$inferSelect;
export type Competitor = typeof competitors.$inferSelect;
