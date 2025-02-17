import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function InvestmentSignalsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Investment & Growth Signals</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">VC Interest Score</h2>
          <div className="space-y-4">
            <p className="text-2xl font-bold">76%</p>
            <Progress value={76} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Recent industry shifts indicate increased investor interest
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Market Indicators</h2>
          <ul className="space-y-2">
            <li>• Increased VC activity in AI-driven platforms</li>
            <li>• Growing market for sustainability solutions</li>
            <li>• Rising demand for compliance automation</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
