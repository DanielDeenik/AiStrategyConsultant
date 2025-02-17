import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TrendForecastingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Market Trend Forecasting</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Growth Opportunities</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-green-500" />
              <p>Blockchain-based compliance tools (+34%)</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="text-red-500" />
              <p>Traditional compliance frameworks (-18%)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Industry Shifts</h2>
          <ul className="space-y-2">
            <li>• Emerging regulatory technology trends</li>
            <li>• Shift towards automated compliance</li>
            <li>• Integration of AI in risk management</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
