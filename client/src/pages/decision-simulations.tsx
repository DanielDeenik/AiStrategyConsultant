import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, BarChart2, TrendingUp } from "lucide-react";
import { type DecisionSimulation, type SimulationScenario } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DecisionSimulationsPage() {
  const { toast } = useToast();
  const [selectedSimulation, setSelectedSimulation] = useState<number>();
  
  const { data: simulations, isLoading: loadingSimulations } = useQuery<DecisionSimulation[]>({
    queryKey: ["/api/decision/simulations/1"], // TODO: Replace with actual strategy ID
  });

  const { data: scenarios, isLoading: loadingScenarios } = useQuery<SimulationScenario[]>({
    queryKey: ["/api/decision/simulation", selectedSimulation, "scenarios"],
    enabled: !!selectedSimulation,
  });

  const runSimulation = async () => {
    try {
      await apiRequest("POST", "/api/decision/simulator", {
        strategyId: 1, // TODO: Replace with actual strategy ID
        title: "Market Expansion Simulation",
        description: "Simulating market expansion strategy impacts",
        parameters: {
          market_size: 1000000,
          target_audience: "Small Businesses",
          timeline_months: 12,
          initial_investment: 500000,
          monthly_budget: 50000,
          competition_level: "medium",
        },
        iterations: 1000,
      });
      toast({
        title: "Success",
        description: "Started new simulation successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start simulation",
        variant: "destructive",
      });
    }
  };

  if (loadingSimulations || (selectedSimulation && loadingScenarios)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Decision Simulations</h1>

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Run New Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runSimulation}>Start Monte Carlo Simulation</Button>
        </CardContent>
      </Card>

      {/* Active Simulations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {simulations && simulations.length > 0 ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {simulations.map((simulation) => (
                  <Card
                    key={simulation.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSimulation === simulation.id
                        ? "border-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedSimulation(simulation.id)}
                  >
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{simulation.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {simulation.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span
                          className={`px-2 py-1 rounded ${
                            simulation.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : simulation.status === "failed"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {simulation.status}
                        </span>
                        <span className="text-muted-foreground">
                          {simulation.monte_carlo_iterations} iterations
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSimulation && scenarios && scenarios.length > 0 && (
                <div className="space-y-6">
                  {/* Financial Impact Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Impact Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scenarios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="financial_impact"
                            fill="#8884d8"
                            name="Financial Impact"
                          />
                          <Bar
                            dataKey="probability"
                            fill="#82ca9d"
                            name="Probability"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Market Adoption Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Adoption Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={scenarios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="market_adoption_rate"
                            stroke="#8884d8"
                            name="Adoption Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Risk Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {scenarios.map((scenario) =>
                          scenario.risk_factors.map((risk, index) => (
                            <Card key={`${scenario.id}-${index}`}>
                              <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2">{risk.name}</h4>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      Probability:
                                    </span>
                                    <span className="ml-2">{risk.probability}%</span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">
                                      Impact:
                                    </span>
                                    <span className="ml-2">{risk.impact}/10</span>
                                  </div>
                                  <p className="text-sm">
                                    Mitigation: {risk.mitigation_strategy}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No simulations available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
