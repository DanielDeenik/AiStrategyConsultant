import OpenAI from "openai";
import { ViralityScore, CompetitiveAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ViralityMetrics {
  social_currency_score: string;
  trigger_score: string;
  emotion_score: string;
  public_score: string;
  practical_value_score: string;
  story_score: string;
  total_score: string;
  confidence: string;
  ai_insights: Record<string, any>;
}

interface CompetitiveMetrics {
  market_share: string;
  relative_strength: string;
  threat_level: number;
  opportunity_score: string;
  ai_recommendations: Record<string, any>;
}

export class AIAnalysisService {
  async analyzeViralityPotential(
    strategy: string,
    marketContext: string
  ): Promise<ViralityMetrics> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI expert in viral marketing and business strategy analysis. 
            Analyze the given strategy using the STEPPS framework (Social Currency, Triggers, Emotion, Public, Practical Value, Stories).
            Provide scores from 0 to 1 for each component and detailed insights.`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nMarket Context: ${marketContext}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as {
        social_currency_score: number;
        trigger_score: number;
        emotion_score: number;
        public_score: number;
        practical_value_score: number;
        story_score: number;
        total_score: number;
        confidence: number;
        insights: Record<string, any>;
      };

      // Convert numeric scores to strings with fixed precision
      return {
        social_currency_score: result.social_currency_score.toFixed(4),
        trigger_score: result.trigger_score.toFixed(4),
        emotion_score: result.emotion_score.toFixed(4),
        public_score: result.public_score.toFixed(4),
        practical_value_score: result.practical_value_score.toFixed(4),
        story_score: result.story_score.toFixed(4),
        total_score: result.total_score.toFixed(4),
        confidence: result.confidence.toFixed(4),
        ai_insights: result.insights,
      };
    } catch (error) {
      console.error("Error analyzing virality:", error);
      throw new Error("Failed to analyze virality potential");
    }
  }

  async analyzeCompetitivePosition(
    strategy: string,
    competitor: string,
    marketData: string
  ): Promise<CompetitiveMetrics> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI expert in competitive analysis and market positioning.
            Analyze the competitive position of the given strategy against the specified competitor.
            Provide detailed metrics and actionable recommendations.`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nCompetitor: ${competitor}\nMarket Data: ${marketData}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as {
        market_share: number;
        relative_strength: number;
        threat_level: number;
        opportunity_score: number;
        recommendations: Record<string, any>;
      };

      return {
        market_share: result.market_share.toFixed(4),
        relative_strength: result.relative_strength.toFixed(4),
        threat_level: Math.min(5, Math.max(1, result.threat_level)),
        opportunity_score: result.opportunity_score.toFixed(4),
        ai_recommendations: result.recommendations,
      };
    } catch (error) {
      console.error("Error analyzing competitive position:", error);
      throw new Error("Failed to analyze competitive position");
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();