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

interface ShortenUrlResponse {
  shortUrl: string;
  originalUrl: string;
}

interface UrlData {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdDate: string;
  username: string;
}

interface AnalyticsState {
  [key: string]: ClickEventDTO[];
}

interface LoadingState {
  [key: string]: boolean;
}

interface ExpandedState {
  [key: string]: boolean;
}

// Add new interface for copy states
interface CopiedState {
  [key: string]: boolean;
}

// Constants
const API_BASE_URL = "http://localhost:8080/api/urls";

const DashboardPage = () => {
  // Graph data state
  const [graphData, setGraphData] = useState<ClickEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL shortening state
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenLoading, setShortenLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // URL management state
  const [urlData, setUrlData] = useState<UrlData[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [expandedAnalytics, setExpandedAnalytics] = useState<ExpandedState>({});
  const [analyticsData, setAnalyticsData] = useState<AnalyticsState>({});
  const [analyticsLoading, setAnalyticsLoading] = useState<LoadingState>({});

  // Add new state for tracking copied URLs
  const [copiedUrls, setCopiedUrls] = useState<CopiedState>({});

  const { isAuthenticated, isLoading } = useAuth();

  const route = useRouter();

  // Helper functions
  const getAuthHeaders = () => {
    const token = SecureTokenStorage.getInstance().getToken();
    if (!token) {
      console.warn("No token found, redirecting to login");
      route.push("/login");
      throw new Error("No authentication token");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const getDateRange = () => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    return {
      startDate: tenDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const getAnalyticsDateRange = () => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    return {
      startDate: tenDaysAgo.toISOString().split("T")[0] + "T00:00:00",
      endDate: today.toISOString().split("T")[0] + "T23:59:59",
    };
  };

  const transformApiData = (apiData: Record<string, number>): ClickEventDTO[] =>
    Object.entries(apiData)
      .map(([clickDate, count]) => ({ clickDate, count }))
      .sort(
        (a, b) =>
          new Date(a.clickDate).getTime() - new Date(b.clickDate).getTime()
      );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  const getFullShortUrl = (shortUrl: string) =>
    `${process.env.NEXT_PUBLIC_API_SUB_DOMAIN}/${shortUrl}`;

  // API functions
  const fetchClickData = useCallback(async (showToast = true) => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();
      const response = await axios.get(`${API_BASE_URL}/totalClicks`, {
        params: { startDate, endDate },
        headers: getAuthHeaders(),
      });

      setGraphData(transformApiData(response.data));

      if (showToast) {
        toast.success("Data refreshed successfully", {
          description: "Click analytics have been updated",
        });
      }
    } catch (err) {
      const errorMessage = "Failed to load click data";
      setError(errorMessage);
      setGraphData([]);

      if (showToast) {
        toast.error("Failed to refresh data", {
          description: "Unable to fetch click analytics. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyUrls = useCallback(async (showToast = true) => {
    try {
      setUrlsLoading(true);
      const response = await axios.get<UrlData[]>(`${API_BASE_URL}/myurls`, {
        headers: getAuthHeaders(),
      });

      // Sort URLs by creation date in descending order (newest first)
      const sortedUrls = response.data.sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );

      setUrlData(sortedUrls);

      if (showToast) {
        toast.success("URLs loaded successfully");
      }
    } catch (err) {
      console.error("Failed to fetch URLs:", err);
      if (showToast) {
        toast.error("Failed to load URLs", {
          description: "Unable to fetch your shortened URLs. Please try again.",
        });
      }
    } finally {
      setUrlsLoading(false);
    }
  }, []);

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
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Failed to load analytics", {
        description: "Unable to fetch analytics data for this URL.",
      });
    } finally {
      setAnalyticsLoading((prev) => ({ ...prev, [shortUrl]: false }));
    }
  };

  // Event handlers
  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Invalid URL", {
        description: "Please enter a valid URL to shorten",
      });
      return;
    }

    try {
      setShortenLoading(true);
      setShortenedUrl(null);

      const response = await axios.post<ShortenUrlResponse>(
        `${API_BASE_URL}/shorten`,
        { originalUrl },
        { headers: getAuthHeaders() }
      );

      const fullUrl = getFullShortUrl(response.data.shortUrl);
      setShortenedUrl(fullUrl);
      setOriginalUrl("");

      toast.success("URL shortened successfully!", {
        description: "Your short link is ready to use",
      });

      // Refresh both analytics data and URLs list
      await Promise.all([fetchClickData(false), fetchMyUrls(false)]);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to shorten URL";

      toast.error("Failed to shorten URL", {
        description: errorMessage,
      });
    } finally {
      setShortenLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setShortenedUrl(null);
    setOriginalUrl("");
    setIsCopied(false);
  };

  // Updated copyToClipboard function with URL key parameter
  const copyToClipboard = async (text: string, urlKey?: string) => {
    try {
      await navigator.clipboard.writeText(text);

      if (urlKey) {
        // For URL management section
        setCopiedUrls((prev) => ({ ...prev, [urlKey]: true }));
        setTimeout(() => {
          setCopiedUrls((prev) => ({ ...prev, [urlKey]: false }));
        }, 2000);
      } else {
        // For dialog (original behavior)
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }

      toast.success("Copied to clipboard!", {
        description: "URL has been copied successfully",
      });
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");

        if (urlKey) {
          setCopiedUrls((prev) => ({ ...prev, [urlKey]: true }));
          setTimeout(() => {
            setCopiedUrls((prev) => ({ ...prev, [urlKey]: false }));
          }, 2000);
        } else {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }

        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Failed to copy", {
          description: "Please copy the URL manually.",
        });
      }

      document.body.removeChild(textArea);
    }
  };

  const toggleAnalytics = async (shortUrl: string) => {
    const isExpanded = expandedAnalytics[shortUrl];

    if (!isExpanded && !analyticsData[shortUrl]) {
      await fetchUrlAnalytics(shortUrl);
    }

    setExpandedAnalytics((prev) => ({
      ...prev,
      [shortUrl]: !isExpanded,
    }));
  };

  const refreshData = () => {
    fetchClickData();
    fetchMyUrls();
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      Promise.all([fetchClickData(false), fetchMyUrls(false)]);
    }
  }, [isLoading, isAuthenticated, fetchClickData, fetchMyUrls]);

  // Loading states
  if (loading || urlsLoading) {
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

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => fetchClickData()} variant="outline">
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
                          {isCopied ? "Copied!" : "Copy"}
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
                      onClick={handleDialogClose}
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
            onClick={refreshData}
            variant="outline"
            size="lg"
            className="order-2 sm:order-1"
          >
            Refresh Data
          </Button>
        </div>

        {/* URL Management Section - Improved Layout */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your URLs</h2>
              <p className="text-muted-foreground">
                Manage and track your shortened links
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {urlData.length} URL{urlData.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {urlData.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LinkIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No URLs yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first short URL to get started with link
                  management
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
                const isAnalyticsExpanded = expandedAnalytics[url.shortUrl];
                const urlAnalytics = analyticsData[url.shortUrl];
                const isLoadingAnalytics = analyticsLoading[url.shortUrl];
                const isCopiedUrl = copiedUrls[url.shortUrl];

                return (
                  <Card
                    key={url.id}
                    className="overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <CardHeader className="">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm ">
                              <Link
                                href={fullShortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex font-semibold items-center gap-1 transition-colors"
                              >
                                {fullShortUrl}
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <div className="flex justify-start">
                                <p
                                  className="text-xs text-muted-foreground "
                                  title={url.originalUrl}
                                >
                                  {truncateUrl(url.originalUrl, 80)}
                                </p>
                              </div>
                            </CardTitle>
                          </div>
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
                              {isCopiedUrl ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAnalytics(url.shortUrl)}
                              className="h-8"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Stats
                              {isAnalyticsExpanded ? (
                                <ChevronUp className="h-3 w-3 ml-1" />
                              ) : (
                                <ChevronDown className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Analytics Section */}
                    {isAnalyticsExpanded && (
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
                          ) : urlAnalytics && urlAnalytics.length > 0 ? (
                            <div className="h-64 bg-muted/30 rounded-lg p-4">
                              <Graph graphData={urlAnalytics} />
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
