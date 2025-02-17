import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Competitor } from "@shared/schema";
import { Star } from "lucide-react";

export default function MarketIntelCard({ competitor }: { competitor: Competitor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{competitor.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Key Strength</h4>
            <p className="text-sm text-muted-foreground">{competitor.strength}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Key Weakness</h4>
            <p className="text-sm text-muted-foreground">{competitor.weakness}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Sentiment:</span>
            <div className="flex">
              {Array.from({ length: competitor.sentiment }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
              {Array.from({ length: 5 - competitor.sentiment }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-muted" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
