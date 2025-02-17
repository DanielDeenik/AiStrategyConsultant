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
  LineChart,
  Line,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  Target,
  BarChart2,
  Brain,
  Zap,
  LineChart as LineChartIcon,
  AlertCircle,
} from "lucide-react";
import {
  type ViralityScore,
  type CompetitiveAnalysis,
  type MarketTrend,
  type PresuasionScore,
} from "@shared/schema";
import { Progress } from "@/components/ui/progress";

export default function MarketIntelligencePage() {
  const { data: presuasionScores, isLoading: loadingPresuasion } = useQuery<PresuasionScore[]>({
    queryKey: ["/api/market-intelligence/pre-suasion"],
  });

  const { data: viralityScores, isLoading: loadingVirality } = useQuery<ViralityScore[]>({
    queryKey: ["/api/analysis/virality"],
  });

  const { data: competitiveAnalysis, isLoading: loadingCompetitive } = useQuery<CompetitiveAnalysis[]>({
    queryKey: ["/api/analysis/competitive"],
  });

  const { data: marketTrends, isLoading: loadingTrends } = useQuery<MarketTrend[]>({
    queryKey: ["/api/market-trends"],
  });

  const isLoading = loadingPresuasion || loadingVirality || loadingCompetitive || loadingTrends;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestPresuasionScore = presuasionScores?.[0];
  const latestViralityScore = viralityScores?.[0];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Market Intelligence</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-Suasion Readiness Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Pre-Suasion Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestPresuasionScore ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Pre-Suasion Score: {parseFloat(latestPresuasionScore.persuasion_score).toFixed(0)}%
                  </h3>
                  <Progress value={parseFloat(latestPresuasionScore.persuasion_score)} />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(latestPresuasionScore.behavioral_insights).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No pre-suasion data available</p>
            )}
          </CardContent>
        </Card>

        {/* Virality Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Virality Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viralityScores && viralityScores.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Virality Score: {parseFloat(latestViralityScore?.total_score ?? "0").toFixed(0)}%
                  </h3>
                  <Progress 
                    value={parseFloat(latestViralityScore?.total_score ?? "0")} 
                    className="mb-4"
                  />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={viralityScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="created_at" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total_score" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">AI Recommendations</p>
                      <ul className="mt-2 space-y-2">
                        {analysis.ai_recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
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
              <LineChartIcon className="h-5 w-5" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketTrends && marketTrends.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="trend_score" 
                      fill="var(--primary)" 
                      name="Trend Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid gap-4">
                  {marketTrends.map((trend) => (
                    <div key={trend.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.keyword}</h4>
                        <span className="text-sm text-muted-foreground">
                          Score: {parseFloat(trend.trend_score).toFixed(0)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                          <p className="font-medium">
                            {(parseFloat(trend.growth_rate) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Industry Impact</p>
                          <p className="font-medium">
                            {parseFloat(trend.industry_impact_score).toFixed(0)}/100
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Related Technologies</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {trend.related_technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No market trend data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}