"use client";

import React from "react";
import { Home, Settings, Building2, Zap, Palette } from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

const iconMap = {
  Building2,
  Zap,
  Palette,
};

const Sidebar: React.FC = () => {
  const { currentTenant, isDarkMode, loading, error } = useTenant();
  const pathname = usePathname();

  // Handle loading state
  if (loading) {
    return (
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-red-600">Error loading tenant</p>
        </div>
      </div>
    );
  }

  // Handle null tenant
  if (!currentTenant) {
    return (
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No tenant found
          </p>
        </div>
      </div>
    );
  }

  // Now safe to use currentTenant
  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div
      className="w-64 border-r flex flex-col transition-all duration-300"
      style={{
        backgroundColor: theme.surface,
        borderColor: currentTenant.theme.border,
      }}
    >
      {/* Tenant Branding Area */}
      <div
        className="p-6 border-b relative overflow-hidden"
        style={{ borderColor: currentTenant.theme.border }}
      >
        <div
          className="absolute inset-0 opacity-3"
          style={{
            background: `linear-gradient(135deg, ${currentTenant.theme.primary}15, ${currentTenant.theme.secondary}10)`,
          }}
        />
        <div className="relative">
          <div className="flex items-center space-x-3">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${currentTenant.theme.primary}15` }}
            >
              {React.createElement(
                iconMap[currentTenant.logo as keyof typeof iconMap] ||
                  Building2,
                {
                  className: "w-7 h-7",
                  style: { color: currentTenant.theme.primary },
                }
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl" style={{ color: theme.text }}>
                {currentTenant.name}
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: theme.textSecondary }}
              >
                {currentTenant.domain}
              </p>
              <div className="mt-2">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${currentTenant.theme.success}15`,
                    color: currentTenant.theme.success,
                  }}
                >
                  ● Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    group relative overflow-hidden
                    ${isActive ? "shadow-sm" : ""}
                  `}
                  style={{
                    backgroundColor: isActive
                      ? currentTenant.theme.primary
                      : "transparent",
                    color: isActive ? "#FFFFFF" : theme.textSecondary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = `${currentTenant.theme.primary}08`;
                      e.currentTarget.style.color = theme.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = theme.textSecondary;
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 transition-transform duration-200" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-0.5 rounded-l"
                      style={{ backgroundColor: "#FFFFFF" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile */}
      <div
        className="p-4 border-t"
        style={{ borderColor: currentTenant.theme.border }}
      >
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-5 transition-all duration-200 cursor-pointer group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: currentTenant.theme.primary }}
          >
            {currentTenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-sm truncate"
              style={{ color: theme.text }}
            >
              Analytics Admin
            </p>
            <p
              className="text-xs truncate"
              style={{ color: theme.textSecondary }}
            >
              admin@{currentTenant.domain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
