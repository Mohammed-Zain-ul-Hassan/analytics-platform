"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  MousePointer,
  Clock,
} from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { MetricData } from "../types/tenant";

interface MetricsCardProps {
  metric: MetricData;
  index: number;
}

const iconMap = {
  Eye,
  Users,
  MousePointer,
  Clock,
};

const MetricsCard: React.FC<MetricsCardProps> = ({ metric, index }) => {
  const { currentTenant, isDarkMode } = useTenant();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!currentTenant) return;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [index, currentTenant]);

  useEffect(() => {
    if (!currentTenant) return;
    if (isVisible) {
      // Handle different value formats (numbers, time duration)
      let numericValue = 0;
      if (metric.value.includes("m") && metric.value.includes("s")) {
        // For time duration like "3m 24s", just animate the minutes
        const minutes = parseFloat(metric.value.match(/(\d+)m/)?.[1] || "0");
        numericValue = minutes;
      } else {
        numericValue = parseFloat(metric.value.replace(/[^\d.]/g, ""));
      }

      const duration = 1200;
      const steps = 50;
      const increment = numericValue / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        current += increment;
        step++;
        setAnimatedValue(current);

        if (step >= steps) {
          setAnimatedValue(numericValue);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, metric.value, currentTenant]);

  if (!currentTenant) {
    return (
      <div className="rounded-xl border p-5">
        <div className="text-center text-gray-500">
          <p>No tenant data available</p>
        </div>
      </div>
    );
  }

  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  const formatValue = (value: number) => {
    if (metric.value.includes("m") && metric.value.includes("s")) {
      // For time duration, show animated minutes + static seconds
      const seconds = metric.value.match(/(\d+)s/)?.[1] || "24";
      return `${Math.round(value)}m ${seconds}s`;
    }
    if (metric.value.includes("%")) {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toLocaleString();
  };

  const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || Clock;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
      style={{
        backgroundColor: theme.surface,
        borderColor: currentTenant.theme.border,
        boxShadow: isDarkMode
          ? "0 1px 3px rgba(0, 0, 0, 0.2)"
          : "0 1px 3px rgba(0, 0, 0, 0.08)",
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2 rounded-lg transition-all duration-300"
            style={{ backgroundColor: `${currentTenant.theme.primary}10` }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: currentTenant.theme.primary }}
            />
          </div>

          <div className="flex items-center space-x-1">
            {metric.changeType === "increase" ? (
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
              className="text-xs font-semibold"
              style={{
                color:
                  metric.changeType === "increase"
                    ? currentTenant.theme.success
                    : currentTenant.theme.error,
              }}
            >
              {metric.change > 0 ? "+" : ""}
              {metric.change}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: theme.textSecondary }}
          >
            {metric.title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold" style={{ color: theme.text }}>
              {formatValue(animatedValue)}
            </p>
            {metric.realTime && (
              <div className="flex items-center space-x-1">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: currentTenant.theme.success }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: currentTenant.theme.success }}
                >
                  LIVE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Neutral sparkline */}
        <div className="mt-4 h-8 flex items-end space-x-0.5">
          {metric.trend.map((value, i) => {
            const height = (value / Math.max(...metric.trend)) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-700"
                style={{
                  height: isVisible ? `${height}%` : "0%",
                  backgroundColor: theme.textSecondary,
                  opacity: 0.3,
                  minHeight: "2px",
                  transitionDelay: `${index * 100 + i * 30}ms`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
