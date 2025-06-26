"use client";

import React, { useState, useEffect } from "react";
import { useTenant } from "../contexts/TenantContext";
import { ChartData } from "../types/tenant";

interface ChartProps {
  data: ChartData;
  className?: string;
  size?: "small" | "medium" | "large";
}

const Chart: React.FC<ChartProps> = ({
  data,
  className = "",
  size = "medium",
}) => {
  const { currentTenant, isDarkMode } = useTenant();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.data.map((d) => d.value));

  const sizeClasses = {
    small: "p-5",
    medium: "p-6",
    large: "p-8",
  };

  const chartHeights = {
    small: "h-32",
    medium: "h-40",
    large: "h-56",
  };

  // Better color distribution for charts
  const getChartColors = () => {
    if (data.type === "donut") {
      return [
        currentTenant.theme.primary,
        currentTenant.theme.secondary,
        currentTenant.theme.accent,
        theme.textSecondary,
      ];
    }
    if (data.type === "bar" && data.id === "device-breakdown") {
      return [
        currentTenant.theme.primary,
        `${currentTenant.theme.primary}80`,
        `${currentTenant.theme.primary}40`,
      ];
    }
    return [currentTenant.theme.primary];
  };

  const chartColors = getChartColors();

  return (
    <div
      className={`rounded-xl border transition-all duration-500 ${
        sizeClasses[size]
      } ${className} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
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
          {data.title}
        </h3>
        {data.timeframe && (
          <span
            className="text-xs px-2 py-1 rounded-md font-medium"
            style={{
              backgroundColor: `${currentTenant.theme.primary}10`,
              color: currentTenant.theme.primary,
            }}
          >
            {data.timeframe}
          </span>
        )}
      </div>

      {data.type === "bar" && (
        <div className="space-y-4">
          {data.data.map((item, index) => (
            <div
              key={item.name}
              className="space-y-2 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between items-center">
                <span
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color:
                      hoveredIndex === index ? theme.text : theme.textSecondary,
                  }}
                >
                  {item.name}
                </span>
                <span
                  className="text-sm font-semibold transition-all duration-200"
                  style={{
                    color: theme.text,
                    transform:
                      hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${currentTenant.theme.border}` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: isVisible
                      ? `${(item.value / maxValue) * 100}%`
                      : "0%",
                    backgroundColor:
                      chartColors[index] || currentTenant.theme.primary,
                    transitionDelay: `${index * 100}ms`,
                    transform:
                      hoveredIndex === index ? "scaleY(1.2)" : "scaleY(1)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {data.type === "line" && (
        <div
          className={`${chartHeights[size]} flex items-end justify-between space-x-1`}
        >
          {data.data.map((item, index) => (
            <div
              key={item.name}
              className="flex-1 flex flex-col items-center space-y-2 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-full rounded-t transition-all duration-700 ease-out relative"
                style={{
                  height: isVisible
                    ? `${(item.value / maxValue) * 100}%`
                    : "0%",
                  backgroundColor: currentTenant.theme.primary,
                  transitionDelay: `${index * 80}ms`,
                  minHeight: "3px",
                  transform:
                    hoveredIndex === index ? "scaleY(1.1)" : "scaleY(1)",
                }}
              >
                {hoveredIndex === index && (
                  <div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: theme.surface,
                      color: theme.text,
                      border: `1px solid ${currentTenant.theme.border}`,
                      boxShadow: isDarkMode
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {item.value.toLocaleString()}
                  </div>
                )}
              </div>
              <span
                className="text-xs font-medium text-center transition-colors duration-200"
                style={{
                  color:
                    hoveredIndex === index ? theme.text : theme.textSecondary,
                }}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.type === "donut" && (
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {data.data.map((item, index) => {
                const total = data.data.reduce((sum, d) => sum + d.value, 0);
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = data.data
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / total) * 100, 0);

                return (
                  <circle
                    key={item.name}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={chartColors[index] || currentTenant.theme.primary}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[10]"
                    style={{
                      strokeDasharray: isVisible ? strokeDasharray : "0 100",
                      transitionDelay: `${index * 150}ms`,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-xl font-bold"
                  style={{ color: theme.text }}
                >
                  {data.data.reduce((sum, d) => sum + d.value, 0)}
                </div>
                <div className="text-xs" style={{ color: theme.textSecondary }}>
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;
