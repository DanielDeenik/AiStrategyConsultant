import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, TrendingUp, Shield, Zap, Target, LineChart } from "lucide-react";
import { type GrowthPlaybook } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AIStrategyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: playbooks, isLoading: loadingPlaybooks } = useQuery<GrowthPlaybook[]>({
    queryKey: ["/api/strategy/scheduled-playbooks"],
  });

  const generatePlaybookMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/strategy/growth-playbook", {
        strategy: "AI-powered growth strategy",
        marketData: "Current market conditions",
        competitorData: "Competitor analysis",
        industryContext: "Industry trends",
        strategyId: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategy/scheduled-playbooks"] });
      toast({
        title: "Success",
        description: "AI Strategy playbook generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI strategy playbook",
        variant: "destructive",
      });
    },
  });

  if (loadingPlaybooks) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Strategy Execution Hub</h1>
          <p className="text-muted-foreground mt-2">
            Data-Driven Decision Intelligence for Growth & Market Dominance
          </p>
        </div>
        <Button 
          size="lg"
          onClick={() => generatePlaybookMutation.mutate()}
          disabled={generatePlaybookMutation.isPending}
        >
          {generatePlaybookMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Generate AI Strategy
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strategy Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">87%</p>
                <Progress value={87} className="w-[60px]" />
              </div>
              <Shield className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competitive Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">Market Leader</p>
                <p className="text-xs text-muted-foreground">4 competitors tracked</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">+34%</p>
                <p className="text-xs text-muted-foreground">Quarter over Quarter</p>
              </div>
              <LineChart className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Strategy Playbooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI-Generated Strategy Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {playbooks && playbooks.length > 0 ? (
              playbooks.map((playbook) => (
                <Card key={playbook.id}>
                  <CardHeader>
                    <CardTitle>{playbook.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {playbook.description}
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Market Insights</h4>
                        <pre className="text-sm bg-muted p-2 rounded-md">
                          {JSON.stringify(playbook.market_insights, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Competitive Analysis</h4>
                        <pre className="text-sm bg-muted p-2 rounded-md">
                          {JSON.stringify(playbook.competitor_insights, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Growth Tactics</h4>
                        <pre className="text-sm bg-muted p-2 rounded-md">
                          {JSON.stringify(playbook.growth_tactics, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No strategy playbooks generated yet. Click the button above to create one.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market & Competitive Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Market Opportunities</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Blockchain-based compliance tools (+34% growth potential)
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                  AI-driven risk assessment (emerging market)
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Traditional compliance frameworks (declining)
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Competitor Movements</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Zap className="h-4 w-4 text-primary mr-2" />
                  CompetitorA launched new AI features
                </li>
                <li className="flex items-center text-sm">
                  <Target className="h-4 w-4 text-primary mr-2" />
                  CompetitorB expanding to new markets
                </li>
                <li className="flex items-center text-sm">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  CompetitorC acquired regulatory tech startup
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}