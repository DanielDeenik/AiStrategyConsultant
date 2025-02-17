import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, BookOpen, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { type GrowthPlaybook } from "@shared/schema";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AIStrategyPage() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();
  
  const { data: playbooks, isLoading: loadingPlaybooks } = useQuery<GrowthPlaybook[]>({
    queryKey: ["/api/strategy/scheduled-playbooks"],
  });

  const schedulePlaybook = async (strategyId: number, date: Date) => {
    try {
      await apiRequest("POST", "/api/strategy/schedule-playbook", {
        strategyId,
        scheduledFor: date.toISOString(),
      });
      toast({
        title: "Success",
        description: "Playbook generation scheduled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule playbook generation",
        variant: "destructive",
      });
    }
  };

  if (loadingPlaybooks) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">AI Strategy</h1>

      {/* Growth Playbooks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Growth Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Schedule New Playbook */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule New Playbook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <Button
                  onClick={() => selectedDate && schedulePlaybook(1, selectedDate)}
                  disabled={!selectedDate}
                  className="w-full"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Generation
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Playbooks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled Playbooks</CardTitle>
              </CardHeader>
              <CardContent>
                {playbooks && playbooks.length > 0 ? (
                  <div className="space-y-4">
                    {playbooks.map((playbook) => (
                      <div
                        key={playbook.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{playbook.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {format(new Date(playbook.scheduled_for!), "PPp")}
                          </p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No scheduled playbooks</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Generated Playbooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Generated Playbooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playbooks && playbooks.length > 0 ? (
            <div className="space-y-4">
              {playbooks.map((playbook) => (
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
                        <h4 className="font-semibold mb-2">Competitor Insights</h4>
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
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No generated playbooks available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
