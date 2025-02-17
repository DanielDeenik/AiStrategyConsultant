import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AsqinInsightsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Asqin BV Market Insights</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Website Analysis</h2>
          <div className="space-y-4">
            <p>AI is analyzing Asqin BV's market positioning in real-time.</p>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-primary/10 rounded w-3/4"></div>
              <div className="h-4 bg-primary/10 rounded w-1/2"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Social Media Sentiment</h2>
          <div className="space-y-4">
            <p>Monitoring public sentiment and trending discussions.</p>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-primary/10 rounded w-2/3"></div>
              <div className="h-4 bg-primary/10 rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
