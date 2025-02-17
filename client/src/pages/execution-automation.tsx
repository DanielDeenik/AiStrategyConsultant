import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Settings, TrendingUp } from "lucide-react";
import { type AutomationTask, type KpiMetric } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ExecutionAutomationPage() {
  const { toast } = useToast();
  
  const { data: tasks, isLoading: loadingTasks } = useQuery<AutomationTask[]>({
    queryKey: ["/api/execution/automation/tasks"],
  });

  const { data: metrics, isLoading: loadingMetrics } = useQuery<KpiMetric[]>({
    queryKey: ["/api/execution/kpi/1"], // TODO: Replace with actual strategy ID
  });

  const generateTasks = async () => {
    try {
      await apiRequest("POST", "/api/execution/automation/tasks", {
        strategy: "Example Strategy",
        marketContext: "Example Market",
        selectedTools: ["notion", "slack"],
        strategyId: 1, // TODO: Replace with actual strategy ID
      });
      toast({
        title: "Success",
        description: "Generated automation tasks successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate automation tasks",
        variant: "destructive",
      });
    }
  };

  if (loadingTasks || loadingMetrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Execution Automation</h1>

      {/* Task Automation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Task Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={generateTasks}>Generate Tasks</Button>
            
            {tasks && tasks.length > 0 ? (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <CardTitle>{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {task.tool}
                        </span>
                        <span className="text-sm bg-muted px-2 py-1 rounded">
                          {task.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No automation tasks available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            KPI Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && metrics.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-semibold">
                      {metric.current_value} {metric.unit}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metric.metric_name}
                    </p>
                    <div className="mt-2">
                      <div className="text-sm">
                        Target: {metric.target_value} {metric.unit}
                      </div>
                      <div className={`text-sm ${
                        metric.status === "ahead"
                          ? "text-green-500"
                          : metric.status === "behind"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}>
                        Status: {metric.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No KPI metrics available</p>
          )}
        </CardContent>
      </Card>

      {/* Tool Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tool Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {["Notion", "Trello", "Slack", "Zapier"].map((tool) => (
              <Card key={tool}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{tool}</h3>
                      <p className="text-sm text-muted-foreground">
                        Not connected
                      </p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
