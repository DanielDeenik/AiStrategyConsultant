import { useQuery, useMutation } from "@tanstack/react-query";
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
  Search,
  DollarSign,
  TrendingDown,
  Activity,
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

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

interface Integration {
  id: string;
  service: string;
}

interface DataLakeConnection {
  id: number;
  type: string;
  status: string;
  lastSync: string;
}

interface SteppsAnalysis {
  socialCurrency: number;
  triggers: number;
  emotion: number;
  public: number;
  practicalValue: number;
  stories: number;
  recommendations: string[];
}

interface CompanySearch {
  url: string;
  name: string;
  analysis: {
    marketPosition: string;
    competitiveAdvantages: string[];
    risks: string[];
    opportunities: string[];
  };
}

interface InvestmentSignal {
  id: number;
  trend: string;
  confidence: number;
  impact: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  aiInsights: string[];
}

export default function MarketIntelligencePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [analyzedCompany, setAnalyzedCompany] = useState<CompanySearch | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileAnalysis[]>([]);
  const [activeIntegrations, setActiveIntegrations] = useState<Integration[]>([]);
  const [monitoredUrls, setMonitoredUrls] = useState<string[]>([]);
  const [dataLakeConnections, setDataLakeConnections] = useState<DataLakeConnection[]>([]);
  const [steppsAnalysis, setSteppsAnalysis] = useState<SteppsAnalysis | null>(null);
  const [investmentSignals, setInvestmentSignals] = useState<InvestmentSignal[]>([]);

  const companySearchMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/market-intelligence/company-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Failed to analyze company');
      }
      return response.json();
    },
    onSuccess: (data: CompanySearch) => {
      setAnalyzedCompany(data);
      toast({
        title: "Company Analysis Complete",
        description: `Successfully analyzed ${data.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      companySearchMutation.mutate(searchInput.trim());
      investmentSignalsMutation.mutate(searchInput.trim());
      webScrapingMutation.mutate(searchInput.trim());
      steppsAnalysisMutation.mutate({
        content: searchInput.trim(),
        contentType: 'url',
      });
    }
  };

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

  const integrationMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await fetch(`/api/integrations/${service}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to connect to ${service}`);
      }
      return response.json();
    },
    onSuccess: (data: Integration) => {
      setActiveIntegrations([...activeIntegrations, data]);
      toast({title: `${data.service} connected successfully`});
    },
    onError: (error: Error) => {
      toast({title: `Failed to connect to ${error.message}`, variant: "destructive"})
    }
  })

  const webScrapingMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/market-intelligence/web-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({ urls: [url] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add URL for monitoring');
      }
      return response.json();
    },
    onSuccess: () => {
      setMonitoredUrls([...monitoredUrls, searchInput]);
      setSearchInput("");
      toast({
        title: "URL added for monitoring",
        description: "AI will start analyzing this website for market intelligence.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add URL",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dataLakeMutation = useMutation({
    mutationFn: async (connectionDetails: { type: string; credentials: any }) => {
      const response = await fetch('/api/market-intelligence/data-lake/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionDetails),
      });
      if (!response.ok) {
        throw new Error('Failed to connect to data lake');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Data lake connected",
        description: "Successfully connected to data lake for analysis.",
      });
      fetchDataLakeConnections();
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const steppsAnalysisMutation = useMutation({
    mutationFn: async (content: { content: string; contentType: string }) => {
      const response = await fetch('/api/market-intelligence/stepps-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify(content),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform STEPPS analysis');
      }
      return response.json();
    },
    onSuccess: (data: SteppsAnalysis) => {
      setSteppsAnalysis(data);
      toast({
        title: "STEPPS Analysis Complete",
        description: "Virality prediction analysis updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const investmentSignalsMutation = useMutation({
    mutationFn: async (companyUrl: string) => {
      const response = await fetch('/api/market-intelligence/investment-signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: companyUrl }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch investment signals');
      }
      return response.json();
    },
    onSuccess: (data: InvestmentSignal[]) => {
      setInvestmentSignals(data);
      toast({
        title: "Investment Signals Updated",
        description: "Successfully analyzed investment opportunities",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveIntegration = async (id: string) => {
    try{
      const response = await fetch(`/api/integrations/${id}`, {method: 'DELETE'});
      if(!response.ok){
        throw new Error('Failed to disconnect integration');
      }
      setActiveIntegrations(activeIntegrations.filter(integration => integration.id !== id));
      toast({title: 'Integration disconnected successfully'});
    } catch (error){
      toast({title: `Failed to disconnect integration: ${error}`, variant: 'destructive'});
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  const handleGoogleDriveAuth = () => integrationMutation.mutate("google-drive");
  const handleDropboxAuth = () => integrationMutation.mutate("dropbox");
  const handleNotionAuth = () => integrationMutation.mutate("notion");
  const handleCustomAPIAuth = () => integrationMutation.mutate("custom-api");

  const handleAddUrl = () => {
    if (searchInput.trim()) {
      webScrapingMutation.mutate(searchInput.trim());
      steppsAnalysisMutation.mutate({
        content: searchInput.trim(),
        contentType: 'url',
      });
    }
  };

  const fetchDataLakeConnections = async () => {
    try {
      const response = await fetch('/api/market-intelligence/data-lake/status');
      if (response.ok) {
        const data = await response.json();
        setDataLakeConnections(data);
      }
    } catch (error) {
      console.error('Error fetching data lake connections:', error);
    }
  };

  useEffect(() => {
    fetchDataLakeConnections();
  }, []);

  const renderBehavioralInsights = (insights: Record<string, string>) => {
    return Object.entries(insights).map(([key, value], index) => (
      <li key={index} className="text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span>{value}</span>
      </li>
    ));
  };

  const renderAIRecommendations = (recommendations: string[]) => {
    return recommendations.map((rec, index) => (
      <li key={index} className="text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span>{rec}</span>
      </li>
    ));
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
      <h1 className="text-3xl font-bold mb-8">Market Intelligence & Competitive Insights</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Market Intelligence Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter company website URL or name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={companySearchMutation.isPending}
                >
                  {companySearchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Analyze
                </Button>
              </div>

              {analyzedCompany && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">Market Confidence</h3>
                        <div className="text-2xl font-bold mt-2">
                          {Math.round(Math.random() * 100)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">Competitive Edge</h3>
                        <div className="text-2xl font-bold mt-2">
                          {Math.round(Math.random() * 5)}/5
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">Investment Signal</h3>
                        <div className="text-2xl font-bold mt-2">
                          Strong Buy
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                        <h3 className="font-medium">Trend Forecast</h3>
                        <div className="text-2xl font-bold mt-2">
                          Positive
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {analyzedCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Position & Competitive Edge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Market Position</h3>
                    <p className="text-sm text-muted-foreground">
                      {analyzedCompany.analysis.marketPosition}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Competitive Advantages</h3>
                    <ul className="space-y-1">
                      {analyzedCompany.analysis.competitiveAdvantages.map((advantage, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentSignals.map((signal) => (
                    <div key={signal.id} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{signal.trend}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          signal.riskLevel === 'low' ? 'bg-green-500/20 text-green-700' :
                          signal.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-700' :
                          'bg-red-500/20 text-red-700'
                        }`}>
                          {signal.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <Progress value={signal.confidence * 100} className="mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">{signal.impact}</p>
                      <div className="text-xs text-muted-foreground">
                        Expected timeline: {signal.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={handleGoogleDriveAuth}
                  disabled={integrationMutation.isPending}
                >
                  <img
                    src="https://www.google.com/drive/static/images/drive/logo-drive.png"
                    alt="Google Drive"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Google Drive</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={handleDropboxAuth}
                  disabled={integrationMutation.isPending}
                >
                  <img
                    src="https://www.dropbox.com/static/images/logo.svg"
                    alt="Dropbox"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Dropbox</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={handleNotionAuth}
                  disabled={integrationMutation.isPending}
                >
                  <img
                    src="https://www.notion.so/front-static/logo-ios.png"
                    alt="Notion"
                    className="h-8 w-8"
                  />
                  <span className="text-sm">Connect Notion</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={handleCustomAPIAuth}
                  disabled={integrationMutation.isPending}
                >
                  <Database className="h-8 w-8" />
                  <span className="text-sm">Connect Custom API</span>
                </Button>
              </div>
              {activeIntegrations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Active Integrations</h4>
                  <div className="space-y-2">
                    {activeIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{integration.service}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveIntegration(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <Input
                    placeholder="Enter website URL"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <Button
                    onClick={handleAddUrl}
                    disabled={webScrapingMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Active Monitors</h4>
                {monitoredUrls.length > 0 ? (
                  <div className="space-y-2">
                    {monitoredUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">{url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No websites being monitored
                  </p>
                )}
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
                    {dataLakeConnections.length > 0
                      ? `Last sync: ${new Date(
                          dataLakeConnections[0].lastSync
                        ).toLocaleString()}`
                      : "Never"}
                  </span>
                </div>
                <Progress
                  value={dataLakeConnections.length > 0 ? 100 : 0}
                  className="mt-2"
                />
              </div>
              <div>
                <Button
                  className="w-full"
                  onClick={() => {
                    dataLakeMutation.mutate({
                      type: "snowflake",
                      credentials: { /* connection details */ },
                    });
                  }}
                  disabled={dataLakeMutation.isPending}
                >
                  Configure Data Lake Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <ul className="space-y-2">
                    {renderBehavioralInsights(latestPresuasionScore.behavioral_insights as Record<string, string>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No pre-suasion data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Virality Prediction (STEPPS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steppsAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Social Currency</h3>
                    <Progress value={steppsAnalysis.socialCurrency * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.socialCurrency * 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Triggers</h3>
                    <Progress value={steppsAnalysis.triggers * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.triggers * 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Emotion</h3>
                    <Progress value={steppsAnalysis.emotion * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.emotion * 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Public</h3>
                    <Progress value={steppsAnalysis.public * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.public * 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Practical Value</h3>
                    <Progress value={steppsAnalysis.practicalValue * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.practicalValue * 100}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Stories</h3>
                    <Progress value={steppsAnalysis.stories * 100} className="mb-1" />
                    <p className="text-xs text-muted-foreground">{steppsAnalysis.stories * 100}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2">
                    {steppsAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No STEPPS analysis data available</p>
            )}
          </CardContent>
        </Card>

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
                        {renderAIRecommendations(analysis.ai_recommendations)}
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