"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SecureTokenStorage } from "@/utils/tokenStorage";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Graph from "./Graph";
import {
  Copy,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  MousePointer,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Types
interface ClickEventDTO {
  clickDate: string;
  count: number;
}

interface UrlData {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdDate: string;
  username: string;
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const DashboardPage = () => {
  // Core state
  const [graphData, setGraphData] = useState<ClickEventDTO[]>([]);
  const [urlData, setUrlData] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL shortening state
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenLoading, setShortenLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // UI state
  const [expandedAnalytics, setExpandedAnalytics] = useState<
    Record<string, boolean>
  >({});
  const [analyticsData, setAnalyticsData] = useState<
    Record<string, ClickEventDTO[]>
  >({});
  const [analyticsLoading, setAnalyticsLoading] = useState<
    Record<string, boolean>
  >({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Helper functions
  const getAuthHeaders = useCallback(() => {
    const token = SecureTokenStorage.getInstance().getToken();
    if (!token) {
      router.push("/login");
      throw new Error("No authentication token");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [router]);

  const getDateRange = (days = 10) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);

    return {
      startDate: pastDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const getAnalyticsDateRange = () => {
    const { startDate, endDate } = getDateRange();
    return {
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T23:59:59`,
    };
  };

  const transformApiData = (apiData: Record<string, number>): ClickEventDTO[] =>
    Object.entries(apiData)
      .map(([clickDate, count]) => ({ clickDate, count }))
      .sort(
        (a, b) =>
          new Date(a.clickDate).getTime() - new Date(b.clickDate).getTime()
      );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const truncateUrl = (url: string, maxLength = 50) =>
    url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;

  const getFullShortUrl = (shortUrl: string) =>
    `${process.env.NEXT_PUBLIC_API_SUB_DOMAIN}/${shortUrl}`;

  // API functions
  const fetchClickData = useCallback(
    async (showToast = true) => {
      try {
        setError(null);
        const { startDate, endDate } = getDateRange();
        const response = await axios.get(`${API_BASE_URL}/totalClicks`, {
          params: { startDate, endDate },
          headers: getAuthHeaders(),
        });

        setGraphData(transformApiData(response.data));
        if (showToast) toast.success("Data refreshed successfully");
      } catch (error) {
        console.error("Failed to fetch click data:", error);
        const errorMessage = "Failed to load click data";
        setError(errorMessage);
        setGraphData([]);
        if (showToast) toast.error("Failed to refresh data");
      }
    },
    [getAuthHeaders]
  );

  const fetchMyUrls = useCallback(
    async (showToast = true) => {
      try {
        const response = await axios.get<UrlData[]>(`${API_BASE_URL}/myurls`, {
          headers: getAuthHeaders(),
        });

        const sortedUrls = response.data.sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
        );

        setUrlData(sortedUrls);
        if (showToast) toast.success("URLs loaded successfully");
      } catch (error) {
        console.error("Failed to fetch URLs:", error);
        if (showToast) toast.error("Failed to load URLs");
      }
    },
    [getAuthHeaders]
  );

  const fetchData = useCallback(
    async (showToast = true) => {
      setLoading(true);
      try {
        await Promise.all([fetchClickData(showToast), fetchMyUrls(showToast)]);
      } finally {
        setLoading(false);
      }
    },
    [fetchClickData, fetchMyUrls]
  );

  const fetchUrlAnalytics = async (shortUrl: string) => {
    try {
      setAnalyticsLoading((prev) => ({ ...prev, [shortUrl]: true }));

      const { startDate, endDate } = getAnalyticsDateRange();
      const response = await axios.get(
        `${API_BASE_URL}/analytics/${shortUrl}`,
        {
          params: { startDate, endDate },
          headers: getAuthHeaders(),
        }
      );

      setAnalyticsData((prev) => ({ ...prev, [shortUrl]: response.data }));
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading((prev) => ({ ...prev, [shortUrl]: false }));
    }
  };

  // Event handlers
  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setShortenLoading(true);
      setShortenedUrl(null);

      const response = await axios.post(
        `${API_BASE_URL}/shorten`,
        { originalUrl },
        { headers: getAuthHeaders() }
      );

      const fullUrl = getFullShortUrl(response.data.shortUrl);
      setShortenedUrl(fullUrl);
      setOriginalUrl("");

      toast.success("URL shortened successfully!");
      await fetchData(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to shorten URL";
      toast.error(errorMessage);
    } finally {
      setShortenLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key?: string) => {
    try {
      await navigator.clipboard.writeText(text);

      if (key) {
        setCopiedStates((prev) => ({ ...prev, [key]: true }));
        setTimeout(
          () => setCopiedStates((prev) => ({ ...prev, [key]: false })),
          2000
        );
      }

      toast.success("Copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.cssText = "position:absolute;left:-9999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        if (key) {
          setCopiedStates((prev) => ({ ...prev, [key]: true }));
          setTimeout(
            () => setCopiedStates((prev) => ({ ...prev, [key]: false })),
            2000
          );
        }
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Failed to copy. Please copy manually.");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const toggleAnalytics = async (shortUrl: string) => {
    const isExpanded = expandedAnalytics[shortUrl];

    if (!isExpanded && !analyticsData[shortUrl]) {
      await fetchUrlAnalytics(shortUrl);
    }

    setExpandedAnalytics((prev) => ({ ...prev, [shortUrl]: !isExpanded }));
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setShortenedUrl(null);
    setOriginalUrl("");
    setCopiedStates({});
  };

  // Effects
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchData(false);
    }
  }, [isLoading, isAuthenticated, fetchData]);

  // Loading states
  if (isLoading || !isAuthenticated) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p>Checking authentication...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => fetchData()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Click Analytics</h1>
          <p className="text-muted-foreground mt-1">Last 10 days performance</p>
        </div>

        {/* Analytics Graph */}
        <Card>
          <CardContent className="p-6">
            {!graphData.length ? (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <h2 className="text-lg font-semibold">No Data Available</h2>
                  <p className="text-muted-foreground">
                    Share your short links to view engagement analytics
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-96">
                <Graph graphData={graphData} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="order-1 sm:order-2">
                <LinkIcon className="h-4 w-4 mr-2" />
                Create Short URL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleShortenUrl}>
                <DialogHeader>
                  <DialogTitle>Shorten URL</DialogTitle>
                  <DialogDescription>
                    Enter a long URL to create a shortened version.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalUrl">Original URL</Label>
                    <Input
                      id="originalUrl"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                    />
                  </div>

                  {shortenedUrl && (
                    <div className="space-y-2">
                      <Label>Shortened URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={shortenedUrl}
                          readOnly
                          className="bg-muted"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => copyToClipboard(shortenedUrl)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {copiedStates.dialog ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetDialog}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={shortenLoading}>
                    {shortenLoading ? "Shortening..." : "Shorten"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => fetchData()}
            variant="outline"
            size="lg"
            className="order-2 sm:order-1"
          >
            Refresh Data
          </Button>
        </div>

        {/* URL Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your URLs</h2>
              <p className="text-muted-foreground">
                Manage and track your shortened links
              </p>
            </div>
            <Badge variant="secondary">
              {urlData.length} URL{urlData.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {urlData.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LinkIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No URLs yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first short URL to get started
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Create Short URL
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:gap-6">
              {urlData.map((url) => {
                const fullShortUrl = getFullShortUrl(url.shortUrl);
                const isExpanded = expandedAnalytics[url.shortUrl];
                const analytics = analyticsData[url.shortUrl];
                const isLoadingAnalytics = analyticsLoading[url.shortUrl];
                const isCopied = copiedStates[url.shortUrl];

                return (
                  <Card
                    key={url.id}
                    className="overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm">
                            <Link
                              href={fullShortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex font-semibold items-center gap-1 transition-colors"
                            >
                              {fullShortUrl}
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <p
                              className="text-xs text-muted-foreground mt-1"
                              title={url.originalUrl}
                            >
                              {truncateUrl(url.originalUrl, 80)}
                            </p>
                          </CardTitle>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-4 w-4" />
                              <span className="font-semibold text-foreground">
                                {url.clickCount}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(url.createdDate)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(fullShortUrl, url.shortUrl)
                              }
                              className="h-8"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {isCopied ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAnalytics(url.shortUrl)}
                              className="h-8"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Stats
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3 ml-1" />
                              ) : (
                                <ChevronDown className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 border-t">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-base flex items-center mt-8 gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics (Last 10 Days)
                          </h4>
                          {isLoadingAnalytics ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                            </div>
                          ) : analytics && analytics.length > 0 ? (
                            <div className="h-64 bg-muted/30 rounded-lg p-4">
                              <Graph graphData={analytics} />
                            </div>
                          ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                              <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                              <p className="font-medium">
                                No data for this period
                              </p>
                              <p className="text-sm">
                                Share your link to start collecting analytics
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
