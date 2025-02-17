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
  Upload,
  Link as LinkIcon,
  Globe,
  Database,
} from "lucide-react";
import {
  type ViralityScore,
  type CompetitiveAnalysis,
  type MarketTrend,
  type PresuasionScore,
} from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface FileAnalysis {
  filename: string;
  fileType: string;
  analysis: {
    insights: string[];
    marketTrends: string[];
    competitorMoves: string[];
    strategicImplications: string[];
  };
  uploadedAt: string;
}

export default function MarketIntelligencePage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<FileAnalysis[]>([]);

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

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/market-intelligence/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (data: FileAnalysis[]) => {
      setUploadedFiles(data);
      toast({
        title: "Files uploaded successfully",
        description: "AI analysis complete. View insights below.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

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

      {/* Data Upload & Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Upload Market Data</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".csv,.json,.xlsx,.xls,.pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploadMutation.isPending}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      {uploadMutation.isPending
                        ? "Analyzing files..."
                        : "Drop files here or click to upload"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Supports CSV, JSON, Excel, and PDF
                    </span>
                  </Label>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Uploaded Files & Analysis</h4>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{file.filename}</h5>
                          <span className="text-xs text-muted-foreground">
                            {new Date(file.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid gap-4 mt-2">
                          <div>
                            <h6 className="text-sm font-medium mb-1">Key Insights</h6>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {file.analysis.insights.map((insight, i) => (
                                <li key={i} className="text-muted-foreground">{insight}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium mb-1">Market Trends</h6>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {file.analysis.marketTrends.map((trend, i) => (
                                <li key={i} className="text-muted-foreground">{trend}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium mb-1">Strategic Implications</h6>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {file.analysis.strategicImplications.map((implication, i) => (
                                <li key={i} className="text-muted-foreground">{implication}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Integrations & API Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <img
                    src="https://www.google.com/drive/static/images/drive/logo-drive.png"
                    alt="Google Drive"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Google Drive</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <img
                    src="https://www.dropbox.com/static/images/logo.svg"
                    alt="Dropbox"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Dropbox</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <img
                    src="https://www.notion.so/front-static/logo-ios.png"
                    alt="Notion"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Notion</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Database className="h-8 w-8" />
                  <span className="text-sm">Connect Custom API</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web Scraping & Data Lake */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Live Web Scraping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Add Website to Monitor</Label>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Enter website URL" />
                  <Button>Add</Button>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Active Monitors</h4>
                <p className="text-sm text-muted-foreground">
                  No websites being monitored
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Lake Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Sync Status</h4>
                  <span className="text-sm text-muted-foreground">
                    Last sync: Never
                  </span>
                </div>
                <Progress value={0} className="mt-2" />
              </div>
              <div>
                <Button className="w-full">
                  Configure Data Lake Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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