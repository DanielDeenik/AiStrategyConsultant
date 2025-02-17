import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GrowthTactic {
  title: string;
  description: string;
  implementation_steps: string[];
  expected_impact: string;
  timeline: string;
  resources_needed: string[];
}

interface PlaybookData {
  title: string;
  description: string;
  market_insights: {
    trends: string[];
    opportunities: string[];
    risks: string[];
  };
  competitor_insights: {
    strengths: string[];
    weaknesses: string[];
    strategies: string[];
  };
  growth_tactics: GrowthTactic[];
  confidence_score: string;
}

export class GrowthPlaybookService {
  async generatePlaybook(
    strategy: string,
    marketData: string,
    competitorData: string,
    industryContext: string
  ): Promise<PlaybookData> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert AI business strategist specializing in growth strategies.
            Using the STEPPS framework (Social Currency, Triggers, Emotion, Public, Practical Value, Stories),
            analyze the provided data and generate a comprehensive growth playbook.
            Focus on actionable, specific tactics that can be implemented within 90 days.
            Consider market trends, competitor movements, and industry context.
            Structure your response as a detailed JSON object with the following sections:
            - Title and description of the growth strategy
            - Market insights (trends, opportunities, risks)
            - Competitor insights (strengths, weaknesses, their strategies)
            - Growth tactics (implementation steps, timeline, expected impact)
            - A confidence score based on data reliability and strategy viability`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nMarket Data: ${marketData}\nCompetitor Data: ${competitorData}\nIndustry Context: ${industryContext}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as PlaybookData;

      // Ensure confidence score is a string with fixed precision
      result.confidence_score = parseFloat(result.confidence_score).toFixed(4);

      return result;
    } catch (error) {
      console.error("Error generating growth playbook:", error);
      throw new Error("Failed to generate growth playbook");
    }
  }

  async schedulePlaybookGeneration(
    strategyId: number,
    userId: number,
    scheduledFor: Date
  ): Promise<void> {
    try {
      const strategy = await storage.getStrategy(strategyId);
      if (!strategy) {
        throw new Error("Strategy not found");
      }

      const marketTrends = await storage.getRecentMarketTrends(5);
      const competitors = await storage.getCompetitors(userId);

      const playbook = await this.generatePlaybook(
        strategy.title,
        JSON.stringify(marketTrends),
        JSON.stringify(competitors),
        strategy.type
      );

      await storage.createGrowthPlaybook({
        ...playbook,
        strategy_id: strategyId,
        user_id: userId,
        scheduled_for: scheduledFor,
      });
    } catch (error) {
      console.error("Error scheduling playbook generation:", error);
      throw new Error("Failed to schedule playbook generation");
    }
  }
}

export const growthPlaybookService = new GrowthPlaybookService();