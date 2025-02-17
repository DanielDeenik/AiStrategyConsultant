import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type StrategyResponse = {
  title: string;
  description: string;
  type: string;
  confidence: number;
};

export async function generateStrategy(prompt: string): Promise<StrategyResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business strategy expert. Generate a strategic recommendation based on the input. Respond with JSON in this format: { 'title': string, 'description': string, 'type': string, 'confidence': number }. The confidence should be between 0 and 100.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }
    return JSON.parse(content) as StrategyResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error("Failed to generate strategy: " + errorMessage);
  }
}

type CompetitorAnalysis = {
  strength: string;
  weakness: string;
  sentiment: number;
};

export async function analyzeCompetitor(name: string): Promise<CompetitorAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a competitive analysis expert. Analyze the given company and provide their key strength, key weakness, and market sentiment. Respond with JSON in this format: { 'strength': string, 'weakness': string, 'sentiment': number }. The sentiment should be between 1 and 5.",
        },
        {
          role: "user",
          content: `Analyze this company: ${name}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }
    return JSON.parse(content) as CompetitorAnalysis;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error("Failed to analyze competitor: " + errorMessage);
  }
}