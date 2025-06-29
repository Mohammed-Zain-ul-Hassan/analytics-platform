"use client";

import React from "react";
import { useTenant } from "../contexts/TenantContext";
import MetricsCard from "./MetricsCard";
import Chart from "./Chart";
import TopPages from "./TopPages";
import RealTimeActivity from "./RealTimeActivity";
import { MetricData, ChartData } from "../types/tenant";

// Realistic Umami-focused metrics with mathematically consistent data
const umamiMetrics: MetricData[] = [
  {
    id: "1",
    title: "Page Views",
    value: "2.4M",
    change: 12.5,
    changeType: "increase",
    icon: "Eye",
    trend: [45, 52, 48, 61, 58, 65, 72, 69, 78, 82, 88, 95],
    realTime: true,
  },
  {
    id: "2",
    title: "Unique Visitors",
    value: "847K",
    change: 8.2,
    changeType: "increase",
    icon: "Users",
    trend: [30, 35, 32, 42, 38, 45, 52, 48, 55, 62, 58, 65],
  },
  {
    id: "3",
    title: "Sessions",
    value: "1.2M",
    change: 15.3,
    changeType: "increase",
    icon: "MousePointer",
    trend: [25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 62],
  },
  {
    id: "4",
    title: "Avg. Session Duration",
    value: "3m 24s",
    change: -2.1,
    changeType: "decrease",
    icon: "Clock",
    trend: [65, 62, 68, 64, 60, 58, 55, 52, 48, 45, 42, 38],
  },
];

const umamiCharts: ChartData[] = [
  {
    id: "traffic-chart",
    title: "Traffic Over Time",
    type: "line",
    timeframe: "Last 7 days",
    data: [
      { name: "Mon", value: 45000 },
      { name: "Tue", value: 52000 },
      { name: "Wed", value: 48000 },
      { name: "Thu", value: 61000 },
      { name: "Fri", value: 55000 },
      { name: "Sat", value: 67000 },
      { name: "Sun", value: 59000 },
    ],
  },
  {
    id: "traffic-sources",
    title: "Traffic Sources",
    type: "donut",
    data: [
      { name: "Direct", value: 42 },
      { name: "Organic Search", value: 28 },
      { name: "Social Media", value: 18 },
      { name: "Referral", value: 12 },
    ],
  },
  {
    id: "device-breakdown",
    title: "Device Types",
    type: "bar",
    data: [
      { name: "Desktop", value: 425000 },
      { name: "Mobile", value: 389000 },
      { name: "Tablet", value: 86000 },
    ],
  },
  {
    id: "browser-breakdown",
    title: "Browser Types",
    type: "bar",
    data: [
      { name: "Chrome", value: 520000 },
      { name: "Safari", value: 245000 },
      { name: "Firefox", value: 89000 },
      { name: "Edge", value: 46000 },
    ],
  },
  {
    id: "countries",
    title: "Top Countries",
    type: "bar",
    data: [
      { name: "United States", value: 340000 },
      { name: "United Kingdom", value: 185000 },
      { name: "Germany", value: 125000 },
      { name: "Canada", value: 95000 },
      { name: "France", value: 78000 },
    ],
  },
];

const Dashboard: React.FC = () => {
  const { currentTenant, loading, error, isDarkMode } = useTenant();

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading tenant...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Handle null tenant
  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Tenant Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This subdomain is not configured.
          </p>
        </div>
      </div>
    );
  }

  // Now safe to use currentTenant
  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  return (
    <div
      className="p-6 min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.background }}
    >
      {/* Real-time Visitor Count */}
      <div className="mb-6">
        <div
          className="inline-flex items-center space-x-3 px-4 py-2 rounded-xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: currentTenant.theme.border,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.2)"
              : "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTenant.theme.success }}
          />
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            <span style={{ color: currentTenant.theme.success }}>247</span>{" "}
            visitors online now
          </span>
        </div>
      </div>

      {/* Tenant Info Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
          Welcome to {currentTenant.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
          Analytics Dashboard • {currentTenant.domain}
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {umamiMetrics.map((metric, index) => (
          <MetricsCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      {/* Main Traffic Chart */}
      <div className="mb-8">
        <Chart data={umamiCharts[0]} size="large" />
      </div>

      {/* Secondary Charts - Traffic Sources & Device Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart data={umamiCharts[1]} size="medium" />
        <Chart data={umamiCharts[2]} size="medium" />
      </div>

      {/* Browser & Countries Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart data={umamiCharts[3]} size="medium" />
        <Chart data={umamiCharts[4]} size="medium" />
      </div>

      {/* Bottom section - Top Pages & Real-time Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopPages />
        <RealTimeActivity />
      </div>

      {/* Umami-specific Quick Actions */}
      <div>
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: theme.surface,
            borderColor: currentTenant.theme.border,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.2)"
              : "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-6"
            style={{ color: theme.text }}
          >
            Analytics Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Export Data", color: currentTenant.theme.primary },
              { label: "Secondary", color: currentTenant.theme.secondary },
              { label: "UTM Tracking", color: currentTenant.theme.accent },
              { label: "Goal Funnels", color: currentTenant.theme.success },
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 active:scale-95 text-white font-medium text-sm"
                style={{
                  backgroundColor: action.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-1px) scale(1.05)";
                  e.currentTarget.style.boxShadow = isDarkMode
                    ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
