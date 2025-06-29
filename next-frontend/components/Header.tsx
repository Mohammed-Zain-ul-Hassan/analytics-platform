"use client";

import React from "react";
import { Search, Moon, Sun, Globe, ChevronDown, Bell } from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const {
    currentTenant,
    isDarkMode,
    toggleDarkMode,
    timeframe,
    setTimeframe,
    loading,
    error,
  } = useTenant();
  const pathname = usePathname();

  // Handle loading state
  if (loading) {
    return (
      <header className="border-b px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
      </header>
    );
  }

  // Handle error state
  if (error) {
    return (
      <header className="border-b px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-sm text-red-600">Error loading tenant</div>
        </div>
      </header>
    );
  }

  // Handle null tenant
  if (!currentTenant) {
    return (
      <header className="border-b px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No tenant found
          </div>
        </div>
      </header>
    );
  }

  // Now safe to use currentTenant
  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  const timeframes = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
  ];

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Analytics Dashboard";
      case "/settings":
        return "Settings";
      default:
        return "Analytics Dashboard";
    }
  };

  const isDashboard = pathname === "/";

  return (
    <header
      className="border-b px-6 py-4 flex items-center justify-between transition-all duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: currentTenant.theme.border,
      }}
    >
      <div className="flex items-center space-x-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold" style={{ color: theme.text }}>
            {getPageTitle()}
          </h1>
          <div className="text-xs mt-0.5">
            <span style={{ color: theme.textSecondary }}>
              {currentTenant.name} Analytics
            </span>
          </div>
        </div>

        {/* Time Period Selector - Only show on Dashboard */}
        {isDashboard && (
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: theme.background,
                borderColor: currentTenant.theme.border,
                color: theme.text,
              }}
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none"
              style={{ color: theme.textSecondary }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Search - Only show on Dashboard */}
        {isDashboard && (
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: theme.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 w-64 text-sm"
              style={{
                backgroundColor: theme.background,
                borderColor: currentTenant.theme.border,
                color: theme.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentTenant.theme.primary;
                e.target.style.boxShadow = `0 0 0 1px ${currentTenant.theme.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentTenant.theme.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        {/* Notifications */}
        <button
          className="p-2 rounded-lg transition-all duration-200 hover:scale-105 relative"
          style={{ backgroundColor: `${currentTenant.theme.primary}08` }}
        >
          <Bell
            className="w-4 h-4"
            style={{ color: currentTenant.theme.primary }}
          />
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: currentTenant.theme.error }}
          />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: `${currentTenant.theme.primary}08` }}
        >
          {isDarkMode ? (
            <Sun
              className="w-4 h-4"
              style={{ color: currentTenant.theme.primary }}
            />
          ) : (
            <Moon
              className="w-4 h-4"
              style={{ color: currentTenant.theme.primary }}
            />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: currentTenant.theme.primary }}
          >
            {currentTenant.name.charAt(0).toUpperCase()}
          </div>
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180"
            style={{ color: theme.textSecondary }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
