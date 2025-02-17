import OpenAI from "openai";
import { StrategyConfidence } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConfidenceMetrics {
  confidence_score: number;
  market_alignment: number;
  competitor_benchmark: number;
  historical_success: number;
  ai_recommendations: Record<string, any>;
}

export class StrategyConfidenceService {
  async calculateConfidence(
    strategy: string,
    marketData: string,
    competitorData: string,
    historicalData: string
  ): Promise<ConfidenceMetrics> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI expert in business strategy analysis.
            Analyze the given strategy and calculate confidence metrics:
            1. Overall confidence score (0-1)
            2. Market alignment score (0-1)
            3. Competitor benchmark score (0-1)
            4. Historical success probability (0-1)
            Provide detailed recommendations for improvement.`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nMarket Data: ${marketData}\nCompetitor Data: ${competitorData}\nHistorical Data: ${historicalData}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as {
        confidence_score: number;
        market_alignment: number;
        competitor_benchmark: number;
        historical_success: number;
        recommendations: Record<string, any>;
      };

      return {
        confidence_score: Math.min(1, Math.max(0, result.confidence_score)),
        market_alignment: Math.min(1, Math.max(0, result.market_alignment)),
        competitor_benchmark: Math.min(1, Math.max(0, result.competitor_benchmark)),
        historical_success: Math.min(1, Math.max(0, result.historical_success)),
        ai_recommendations: result.recommendations,
      };
    } catch (error) {
      console.error("Error calculating strategy confidence:", error);
      throw new Error("Failed to calculate strategy confidence");
    }
  }
}

export const strategyConfidenceService = new StrategyConfidenceService();
