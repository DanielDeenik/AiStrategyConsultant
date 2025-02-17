import OpenAI from "openai";
import { storage } from "../storage";
import { type InsertDecisionSimulation, type InsertSimulationScenario } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SimulationParameters {
  market_size: number;
  target_audience: string;
  timeline_months: number;
  initial_investment: number;
  monthly_budget: number;
  competition_level: string;
}

interface RiskFactor {
  name: string;
  probability: number;
  impact: number;
  mitigation_strategy: string;
}

interface SimulationMetrics {
  revenue_growth: number;
  market_share: number;
  roi: number;
  break_even_months: number;
  customer_acquisition_cost: number;
  lifetime_value: number;
}

interface ScenarioResult {
  name: string;
  probability: number;
  financial_impact: number;
  market_adoption_rate: number;
  risk_factors: RiskFactor[];
  metrics: SimulationMetrics;
}

export class DecisionSimulationService {
  async runSimulation(
    strategy: string,
    parameters: SimulationParameters,
    iterations: number
  ): Promise<ScenarioResult[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert AI business analyst specializing in Monte Carlo simulations and predictive modeling.
            Generate detailed business scenarios based on the provided strategy and parameters.
            For each scenario:
            - Calculate probability and financial impact
            - Estimate market adoption rates
            - Identify key risk factors and mitigation strategies
            - Project key business metrics
            Use Monte Carlo simulation principles to account for uncertainty and variability.
            Structure the response as a JSON array of scenarios.`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nParameters: ${JSON.stringify(parameters)}\nIterations: ${iterations}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as { scenarios: ScenarioResult[] };
      return result.scenarios;
    } catch (error) {
      console.error("Error running simulation:", error);
      throw new Error("Failed to run simulation");
    }
  }

  async createSimulation(
    strategyId: number,
    userId: number,
    title: string,
    description: string,
    parameters: SimulationParameters,
    iterations: number
  ): Promise<void> {
    try {
      const strategy = await storage.getStrategy(strategyId);
      if (!strategy) {
        throw new Error("Strategy not found");
      }

      const simulation: InsertDecisionSimulation = {
        strategy_id: strategyId,
        user_id: userId,
        title,
        description,
        input_parameters: parameters,
        monte_carlo_iterations: iterations,
      };

      const createdSimulation = await storage.createDecisionSimulation(simulation);

      const scenarios = await this.runSimulation(
        strategy.title,
        parameters,
        iterations
      );

      await Promise.all(
        scenarios.map((scenario) =>
          storage.createSimulationScenario({
            simulation_id: createdSimulation.id,
            name: scenario.name,
            probability: scenario.probability.toString(),
            financial_impact: scenario.financial_impact.toString(),
            market_adoption_rate: scenario.market_adoption_rate.toString(),
            risk_factors: scenario.risk_factors,
            metrics: scenario.metrics,
          })
        )
      );

      await storage.updateSimulationStatus(createdSimulation.id, "completed");
    } catch (error) {
      console.error("Error creating simulation:", error);
      throw new Error("Failed to create simulation");
    }
  }
}

export const decisionSimulationService = new DecisionSimulationService();
