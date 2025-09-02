"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Graph from "./Graph";
import { Button } from "@/components/ui/button";
import { SecureTokenStorage } from "@/utils/tokenStorage";
import { div } from "motion/react-client";

interface ClickEventDTO {
  clickDate: string;
  count: number;
}

const DashboardPage = () => {
  const [graphData, setGraphData] = useState<ClickEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  const transformApiData = (apiData: Record<string, number>): ClickEventDTO[] =>
    Object.entries(apiData)
      .map(([clickDate, count]) => ({ clickDate, count }))
      .sort(
        (a, b) =>
          new Date(a.clickDate).getTime() - new Date(b.clickDate).getTime()
      );

  const fetchClickData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(today.getDate() - 10);

      const startDate = formatDate(tenDaysAgo);
      const endDate = formatDate(today);

      const token = SecureTokenStorage.getInstance().getToken();
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        "http://localhost:8080/api/urls/totalClicks",
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGraphData(transformApiData(response.data));
    } catch {
      setError("Failed to load click data");
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClickData();
  }, [fetchClickData]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading click data...
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchClickData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="">
        <div className="">
          <h1 className="text-center">Click Analytics (Last 10 Days)</h1>
        </div>
        <div className="relative my-16">
          {!graphData && (
            <div className="aboslute flex flex-col items-center mb-8">
              <h2>No Data for this time period.</h2>
              <p>
                Share your shortlink to view where your engagements are coming
                from
              </p>
            </div>
          )}
          <div>
            <Graph graphData={graphData} />
          </div>
        </div>
        <div className="flex gap-2 items-center justify-end">
          <Button className="">Create new short URL</Button>
          <Button onClick={fetchClickData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
