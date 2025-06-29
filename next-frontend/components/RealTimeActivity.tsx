"use client";

import React, { useState, useEffect } from "react";
import { Eye, Users, Globe } from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { RealTimeActivity as RealTimeActivityType } from "../types/tenant";

// Realistic Umami real-time activities
const mockActivities: RealTimeActivityType[] = [
  {
    id: "1",
    type: "pageview",
    page: "/",
    location: "New York, US",
    timestamp: new Date(),
  },
  {
    id: "2",
    type: "session",
    page: "/blog",
    location: "London, UK",
    timestamp: new Date(Date.now() - 15000),
  },
  {
    id: "3",
    type: "pageview",
    page: "/about",
    location: "Tokyo, JP",
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: "4",
    type: "pageview",
    page: "/pricing",
    location: "Berlin, DE",
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: "5",
    type: "session",
    page: "/features",
    location: "Toronto, CA",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "6",
    type: "pageview",
    page: "/contact",
    location: "Sydney, AU",
    timestamp: new Date(Date.now() - 75000),
  },
];

// Add ClientOnly utility
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

const RealTimeActivity: React.FC = () => {
  const { currentTenant, isDarkMode } = useTenant();
  const [activities, setActivities] = useState(mockActivities);
  const [liveCount, setLiveCount] = useState(247);

  useEffect(() => {
    if (!currentTenant) return;
    const interval = setInterval(() => {
      const pages = [
        "/",
        "/blog",
        "/about",
        "/pricing",
        "/features",
        "/contact",
        "/docs",
      ];
      const locations = [
        "San Francisco, US",
        "Paris, FR",
        "Sydney, AU",
        "Toronto, CA",
        "Amsterdam, NL",
        "Singapore, SG",
        "Stockholm, SE",
        "Dublin, IE",
      ];

      const newActivity: RealTimeActivityType = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? "session" : "pageview",
        page: pages[Math.floor(Math.random() * pages.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
      setLiveCount((prev) =>
        Math.max(200, prev + Math.floor(Math.random() * 6) - 2)
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [currentTenant]);

  if (!currentTenant) {
    return (
      <div className="rounded-xl border p-6">
        <div className="text-center text-gray-500">
          <p>No tenant data available</p>
        </div>
      </div>
    );
  }

  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pageview":
        return Eye;
      case "session":
        return Users;
      default:
        return Eye;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "pageview":
        return currentTenant.theme.primary;
      case "session":
        return currentTenant.theme.secondary;
      default:
        return currentTenant.theme.primary;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      className="rounded-xl border p-6 transition-all duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: currentTenant.theme.border,
        boxShadow: isDarkMode
          ? "0 1px 3px rgba(0, 0, 0, 0.2)"
          : "0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
          Real-time Activity
        </h3>
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTenant.theme.success }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: currentTenant.theme.success }}
          >
            {liveCount} active
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {activities.map((activity, index) => {
          const IconComponent = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-5 transition-all duration-200 animate-fadeIn"
              style={{
                animationDelay: `${index * 50}ms`,
                backgroundColor: index === 0 ? `${color}08` : "transparent",
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <IconComponent className="w-3 h-3" style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className="font-medium text-sm"
                    style={{ color: theme.text }}
                  >
                    {activity.page}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${color}10`,
                      color: color,
                    }}
                  >
                    {activity.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Globe
                    className="w-2.5 h-2.5"
                    style={{ color: theme.textSecondary }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    {activity.location}
                  </span>
                </div>
              </div>

              <span
                className="text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                <ClientOnly>{formatTimeAgo(activity.timestamp)}</ClientOnly>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealTimeActivity;
