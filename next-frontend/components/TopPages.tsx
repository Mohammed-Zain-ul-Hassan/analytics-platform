"use client";

import React, { useState } from "react";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { TopPage } from "../types/tenant";

// Realistic Umami top pages data with proper view counts
const umamiTopPages: TopPage[] = [
  { path: "/", views: 425847, change: 15.2 },
  { path: "/blog", views: 189324, change: 8.7 },
  { path: "/about", views: 156421, change: -2.1 },
  { path: "/contact", views: 98156, change: 12.8 },
  { path: "/pricing", views: 87847, change: -5.3 },
  { path: "/features", views: 62934, change: 22.1 },
];

const TopPages: React.FC = () => {
  const { currentTenant, isDarkMode } = useTenant();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

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
      <h3 className="text-lg font-semibold mb-6" style={{ color: theme.text }}>
        Top Pages
      </h3>

      <div className="space-y-1">
        {umamiTopPages.map((page, index) => (
          <div
            key={page.path}
            className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer group"
            style={{
              backgroundColor:
                hoveredIndex === index
                  ? `${currentTenant.theme.primary}05`
                  : "transparent",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center space-x-3 flex-1">
              <span
                className="font-mono text-sm font-medium"
                style={{ color: theme.text }}
              >
                {page.path}
              </span>
              <ExternalLink
                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: theme.textSecondary }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <span
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {page.views.toLocaleString()}
              </span>

              <div className="flex items-center space-x-1 min-w-[50px] justify-end">
                {page.change > 0 ? (
                  <TrendingUp
                    className="w-3 h-3"
                    style={{ color: currentTenant.theme.success }}
                  />
                ) : (
                  <TrendingDown
                    className="w-3 h-3"
                    style={{ color: currentTenant.theme.error }}
                  />
                )}
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      page.change > 0
                        ? currentTenant.theme.success
                        : currentTenant.theme.error,
                  }}
                >
                  {page.change > 0 ? "+" : ""}
                  {page.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPages;
