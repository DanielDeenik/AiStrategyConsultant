import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ViralityPredictionPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">STEPPS Framework Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Virality Score</h2>
          <div className="space-y-4">
            <p className="text-2xl font-bold">82%</p>
            <Progress value={82} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Strong product positioning with room for improved storytelling
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
          <ul className="space-y-2">
            <li>• Incorporate more user-generated testimonials</li>
            <li>• Enhance emotional storytelling elements</li>
            <li>• Increase social proof through case studies</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
