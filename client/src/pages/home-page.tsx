import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Strategy, Competitor } from "@shared/schema";
import { Bell, TrendingUp, AlertCircle } from "lucide-react";

export default function HomePage() {
  const { data: strategies = [] } = useQuery<Strategy[]>({
    queryKey: ["/api/strategies"],
  });

  const { data: competitors = [] } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

  return (
    <MainLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content (Real-Time Alerts & AI Summaries) */}
        <div className="col-span-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

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
                  <div key={competitor.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="font-medium">{competitor.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Sentiment: {competitor.sentiment}/5
                    </span>
                  </div>
                ))}
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
                  <div key={strategy.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (Recent AI Decisions & Suggested Actions) */}
        <div className="col-span-4">
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
                  <div key={strategy.id} className="flex items-start space-x-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{strategy.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {strategy.confidence}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}