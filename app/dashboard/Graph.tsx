"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  ChartOptions,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

// Define the structure of your graph data
interface ClickEventDTO {
  clickDate: string;
  count: number;
}

interface GraphProps {
  graphData?: ClickEventDTO[];
}

const Graph = ({ graphData = [] }: GraphProps) => {
  // Generate placeholder data for empty state
  const generatePlaceholderData = () => ({
    labels: Array(14).fill(""),
    data: [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1],
  });

  // Process actual graph data
  const processGraphData = () => ({
    labels: graphData.map((item) => item.clickDate),
    data: graphData.map((item) => item.count),
  });

  const hasData = graphData.length > 0;
  const { labels, data: chartData } = hasData
    ? processGraphData()
    : generatePlaceholderData();

  const data = {
    labels,
    datasets: [
      {
        label: "Total Clicks",
        data: chartData,
        backgroundColor: hasData ? "#3b82f6" : "rgba(54, 162, 235, 0.1)",
        borderColor: "#1D2327",
        barThickness: 20,
        categoryPercentage: 1.5,
        barPercentage: 1.5,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            // Only show integer values on y-axis
            return Number.isInteger(Number(value)) ? value.toString() : "";
          },
        },
        title: {
          display: true,
          text: "Number Of Clicks",
          font: {
            family: "Arial",
            size: 16,
            weight: "bold" as const,
          },
          color: "#FF0000",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          font: {
            family: "Arial",
            size: 16,
            weight: "bold" as const,
          },
          color: "#FF0000",
        },
      },
    },
  };

  return <Bar className="w-full" data={data} options={options} />;
};

export default Graph;
