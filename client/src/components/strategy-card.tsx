import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Strategy } from "@shared/schema";

export default function StrategyCard({ strategy }: { strategy: Strategy }) {
  const formattedDate = strategy.created_at 
    ? new Date(strategy.created_at).toLocaleDateString()
    : 'Date not available';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{strategy.title}</CardTitle>
          <Badge variant="secondary">{strategy.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Confidence: {strategy.confidence}%
          </span>
          <span className="text-muted-foreground">
            {formattedDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}