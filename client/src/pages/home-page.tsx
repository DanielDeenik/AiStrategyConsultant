import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Strategy, Competitor } from "@shared/schema";
import { Bell, TrendingUp, AlertCircle, LineChart, Users, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const { data: strategies = [] } = useQuery<Strategy[]>({
    queryKey: ["/api/strategies"],
  });

  const { data: competitors = [] } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Market Confidence
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <Progress value={98} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                +2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Competitors Tracked
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitors.length}</div>
              <Progress value={competitors.length * 10} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Active monitoring enabled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Strategy Health
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{strategies.length} Active</div>
              <Progress value={strategies.length * 20} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Based on market alignment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content (Real-Time Alerts & AI Summaries) */}
          <div className="col-span-12 md:col-span-8">
            {/* Market Intelligence Updates */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Market Intelligence Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitors.map((competitor) => (
                    <div key={competitor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div>
                        <span className="font-medium">{competitor.name}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {competitor.strength}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Sentiment: {competitor.sentiment}/5
                        </span>
                        <Progress value={competitor.sentiment * 20} className="w-20" />
                      </div>
                    </div>
                  ))}
                  {competitors.length === 0 && (
                    <p className="text-muted-foreground text-sm">No competitors analyzed yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI-Generated Strategic Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Strategic Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{strategy.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {strategy.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {strategy.description}
                      </p>
                      <div className="mt-2">
                        <Progress value={strategy.confidence} />
                      </div>
                    </div>
                  ))}
                  {strategies.length === 0 && (
                    <p className="text-muted-foreground text-sm">No strategies generated yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar (Recent AI Decisions & Suggested Actions) */}
          <div className="col-span-12 md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Recent Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.slice(0, 3).map((strategy) => (
                    <div key={strategy.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{strategy.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {strategy.type}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {strategy.confidence}%
                          </span>
                          <Progress value={strategy.confidence} className="w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {strategies.length === 0 && (
                    <p className="text-muted-foreground text-sm">No recent insights available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}