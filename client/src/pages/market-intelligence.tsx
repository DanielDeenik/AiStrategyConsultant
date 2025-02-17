import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, Target, BarChart2 } from "lucide-react";
import { type ViralityScore, type CompetitiveAnalysis, type MarketTrend } from "@shared/schema";

export default function MarketIntelligencePage() {
  const { data: viralityScores, isLoading: loadingVirality } = useQuery<ViralityScore[]>({
    queryKey: ["/api/analysis/virality"],
  });

  const { data: competitiveAnalysis, isLoading: loadingCompetitive } = useQuery<CompetitiveAnalysis[]>({
    queryKey: ["/api/analysis/competitive"],
  });

  const { data: marketTrends, isLoading: loadingTrends } = useQuery<MarketTrend[]>({
    queryKey: ["/api/market-trends"],
  });

  const isLoading = loadingVirality || loadingCompetitive || loadingTrends;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Market Intelligence</h1>

      {/* Virality Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Virality Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viralityScores && viralityScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viralityScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No virality data available</p>
          )}
        </CardContent>
      </Card>

      {/* Competitive Edge Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitive Edge Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {competitiveAnalysis && competitiveAnalysis.length > 0 ? (
            <div className="space-y-4">
              {competitiveAnalysis.map((analysis) => (
                <div key={analysis.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Competitive Analysis #{analysis.id}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Market Share</p>
                      <p className="text-lg font-medium">{analysis.market_share}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Threat Level</p>
                      <p className="text-lg font-medium">{analysis.threat_level}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No competitive analysis data available</p>
          )}
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketTrends && marketTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trend_score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">No market trend data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
