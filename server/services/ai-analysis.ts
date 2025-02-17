import OpenAI from "openai";
import { ViralityScore, CompetitiveAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ViralityMetrics {
  social_currency_score: number;
  trigger_score: number;
  emotion_score: number;
  public_score: number;
  practical_value_score: number;
  story_score: number;
  total_score: number;
  confidence: number;
  ai_insights: Record<string, any>;
}

interface CompetitiveMetrics {
  market_share: number;
  relative_strength: number;
  threat_level: number;
  opportunity_score: number;
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

      // Normalize and validate scores
      const scores = {
        social_currency_score: Math.min(1, Math.max(0, result.social_currency_score)),
        trigger_score: Math.min(1, Math.max(0, result.trigger_score)),
        emotion_score: Math.min(1, Math.max(0, result.emotion_score)),
        public_score: Math.min(1, Math.max(0, result.public_score)),
        practical_value_score: Math.min(1, Math.max(0, result.practical_value_score)),
        story_score: Math.min(1, Math.max(0, result.story_score)),
        total_score: Math.min(1, Math.max(0, result.total_score)),
        confidence: Math.min(1, Math.max(0, result.confidence)),
        ai_insights: result.insights,
      };

      return scores;
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
        market_share: Math.min(1, Math.max(0, result.market_share)),
        relative_strength: Math.min(1, Math.max(0, result.relative_strength)),
        threat_level: Math.min(5, Math.max(1, result.threat_level)),
        opportunity_score: Math.min(1, Math.max(0, result.opportunity_score)),
        ai_recommendations: result.recommendations,
      };
    } catch (error) {
      console.error("Error analyzing competitive position:", error);
      throw new Error("Failed to analyze competitive position");
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();