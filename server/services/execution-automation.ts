import OpenAI from "openai";
import { storage } from "../storage";
import { type InsertAutomationTask, type InsertKpiMetric } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TaskDetails {
  title: string;
  description: string;
  tool: string;
  action_details: {
    tool_specific_steps: string[];
    required_inputs: Record<string, any>;
    expected_outputs: Record<string, any>;
    success_criteria: string[];
  };
}

interface KPITarget {
  metric_name: string;
  target_value: number;
  unit: string;
  timeline: string;
  tracking_frequency: string;
}

export class ExecutionAutomationService {
  async generateAutomationTasks(
    strategy: string,
    marketContext: string,
    selectedTools: string[]
  ): Promise<TaskDetails[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI expert in business process automation and workflow optimization.
            Generate a detailed execution plan with specific tasks that can be automated using the selected tools.
            Each task should be actionable and include specific implementation steps.
            Structure the response as a JSON array of tasks with the following for each task:
            - Title and description
            - Selected tool for automation
            - Detailed action steps
            - Required inputs and expected outputs
            - Success criteria`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nMarket Context: ${marketContext}\nAvailable Tools: ${selectedTools.join(", ")}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as { tasks: TaskDetails[] };
      return result.tasks;
    } catch (error) {
      console.error("Error generating automation tasks:", error);
      throw new Error("Failed to generate automation tasks");
    }
  }

  async generateKPITargets(
    strategy: string,
    marketData: string,
    historicalPerformance: string
  ): Promise<KPITarget[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI expert in business metrics and KPI setting.
            Analyze the strategy and data to suggest appropriate KPI targets.
            Consider market conditions and historical performance when setting targets.
            Structure the response as a JSON array of KPI targets with:
            - Metric name and unit
            - Target value with timeline
            - Tracking frequency`,
          },
          {
            role: "user",
            content: `Strategy: ${strategy}\nMarket Data: ${marketData}\nHistorical Performance: ${historicalPerformance}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content) as { kpi_targets: KPITarget[] };
      return result.kpi_targets;
    } catch (error) {
      console.error("Error generating KPI targets:", error);
      throw new Error("Failed to generate KPI targets");
    }
  }

  async createAutomationTask(
    taskDetails: TaskDetails,
    strategyId: number,
    userId: number
  ): Promise<InsertAutomationTask> {
    return {
      strategy_id: strategyId,
      user_id: userId,
      title: taskDetails.title,
      description: taskDetails.description,
      tool: taskDetails.tool as "notion" | "trello" | "slack" | "zapier",
      action_details: taskDetails.action_details,
      scheduled_for: new Date(),
    };
  }

  async createKPIMetric(
    kpiTarget: KPITarget,
    strategyId: number,
    userId: number
  ): Promise<InsertKpiMetric> {
    return {
      strategy_id: strategyId,
      user_id: userId,
      metric_name: kpiTarget.metric_name,
      target_value: kpiTarget.target_value.toString(),
      current_value: "0",
      unit: kpiTarget.unit,
      status: "behind",
    };
  }
}

export const executionAutomationService = new ExecutionAutomationService();
