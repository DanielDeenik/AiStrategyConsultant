import OpenAI from "openai";
import { InsertMarketTrend } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TrendForecastResult {
  trend_score: number;
  sentiment_score: number;
  volume: number;
  growth_rate: number;
  industry_impact_score: number;
  venture_capital_interest: number;
  forecast_confidence: number;
  predicted_peak_date: Date;
  ai_insights: Record<string, any>;
  related_technologies: string[];
}

export class MarketTrendsService {
  async analyzeTrend(
    keyword: string,
    industryCategory: string,
    marketData: string
  ): Promise<TrendForecastResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are an AI market trend analyst. Analyze the given market data and provide detailed trend forecasting metrics. Output in JSON format with the following structure: trend_score (0-100), sentiment_score (0-100), volume (integer), growth_rate (0-1), industry_impact_score (0-100), venture_capital_interest (0-100), forecast_confidence (0-1), predicted_peak_date (ISO date string), ai_insights (object), related_technologies (array of strings).",
          },
          {
            role: "user",
            content: `Analyze this trend:\nKeyword: ${keyword}\nIndustry: ${industryCategory}\nMarket Data: ${marketData}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content);
      
      return {
        trend_score: result.trend_score,
        sentiment_score: result.sentiment_score,
        volume: result.volume,
        growth_rate: result.growth_rate,
        industry_impact_score: result.industry_impact_score,
        venture_capital_interest: result.venture_capital_interest,
        forecast_confidence: result.forecast_confidence,
        predicted_peak_date: new Date(result.predicted_peak_date),
        ai_insights: result.ai_insights,
        related_technologies: result.related_technologies,
      };
    } catch (error) {
      console.error("Error analyzing market trend:", error);
      throw new Error("Failed to analyze market trend");
    }
  }

  async aggregateTrendInsights(
    trends: TrendForecastResult[]
  ): Promise<Record<string, any>> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI market insights aggregator. Analyze multiple trends and provide a comprehensive market outlook. Output in JSON format with insights, recommendations, and risk factors.",
          },
          {
            role: "user",
            content: JSON.stringify(trends),
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Error aggregating trend insights:", error);
      throw new Error("Failed to aggregate trend insights");
    }
  }
}

export const marketTrendsService = new MarketTrendsService();
