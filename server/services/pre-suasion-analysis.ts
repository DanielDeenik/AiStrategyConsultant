import OpenAI from "openai";
import { InsertPresuasionScore, InsertABTestResult } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

export interface PresuasionAnalysisResult {
  persuasion_score: number;
  behavioral_insights: Record<string, any>;
  sentiment_analysis: Record<string, any>;
  conversion_probability: number;
  recommendations: Record<string, any>;
}

export const presuasionAnalysisService = {
  async analyzeContent(
    content: string,
    contentType: "text" | "image" | "video" | "campaign"
  ): Promise<PresuasionAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: 
              "You are a Pre-Suasion expert AI system. Analyze the content for persuasive elements, behavioral triggers, and provide insights using Cialdini's principles. Output JSON with keys: persuasion_score (0-100), behavioral_insights (object), sentiment_analysis (object), conversion_probability (0-1), and recommendations (object)."
          },
          {
            role: "user",
            content: `Content Type: ${contentType}\n\nContent: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        persuasion_score: result.persuasion_score,
        behavioral_insights: result.behavioral_insights,
        sentiment_analysis: result.sentiment_analysis,
        conversion_probability: result.conversion_probability,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error("Error analyzing content:", error);
      throw new Error("Failed to analyze content for pre-suasion insights");
    }
  },

  async generateABTestVariants(
    content: string,
    contentType: "text" | "image" | "video" | "campaign"
  ): Promise<{ variants: string[]; predictions: Record<string, number> }> {
    try {
      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Generate A/B test variants for the content and predict their engagement rates. Output JSON with keys: variants (array of strings) and predictions (object with variant indices as keys and predicted engagement rates as values)."
          },
          {
            role: "user",
            content: `Content Type: ${contentType}\n\nOriginal Content: ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        variants: result.variants,
        predictions: result.predictions
      };
    } catch (error) {
      console.error("Error generating A/B test variants:", error);
      throw new Error("Failed to generate A/B test variants");
    }
  }
};
