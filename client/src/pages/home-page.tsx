import { useQuery, useMutation } from "@tanstack/react-query";
import { Strategy, Competitor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import StrategyCard from "@/components/strategy-card";
import MarketIntelCard from "@/components/market-intel-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [competitor, setCompetitor] = useState("");

  const { data: strategies = [], isLoading: strategiesLoading } = useQuery<Strategy[]>({
    queryKey: ["/api/strategies"]
  });

  const { data: competitors = [], isLoading: competitorsLoading } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"]
  });

  const generateStrategyMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/strategies/generate", { prompt });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      setPrompt("");
      toast({
        title: "Strategy generated",
        description: "New strategy has been created successfully",
      });
    },
  });

  const analyzeCompetitorMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/competitors/analyze", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      setCompetitor("");
      toast({
        title: "Competitor analyzed",
        description: "New competitor analysis has been created",
      });
    },
  });

  if (strategiesLoading || competitorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
        <Button variant="outline" onClick={() => logoutMutation.mutate()}>
          Logout
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter your business question..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={() => generateStrategyMutation.mutate(prompt)}
              disabled={generateStrategyMutation.isPending || !prompt}
            >
              Generate Strategy
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Generated Strategies</h2>
            {strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter competitor name..."
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
            />
            <Button
              onClick={() => analyzeCompetitorMutation.mutate(competitor)}
              disabled={analyzeCompetitorMutation.isPending || !competitor}
            >
              Analyze Competitor
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Market Intelligence</h2>
            {competitors.map((competitor) => (
              <MarketIntelCard key={competitor.id} competitor={competitor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
