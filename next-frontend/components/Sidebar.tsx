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
  const { currentTenant, availableTenants, switchTenant, isDarkMode } =
    useTenant();
  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;
  const pathname = usePathname();

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
          <div className="flex items-center space-x-3 mb-4">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${currentTenant.theme.primary}15` }}
            >
              {React.createElement(
                iconMap[currentTenant.logo as keyof typeof iconMap] ||
                  Building2,
                {
                  className: "w-6 h-6",
                  style: { color: currentTenant.theme.primary },
                }
              )}
            </div>
            <div>
              <h2
                className="font-semibold text-lg"
                style={{ color: theme.text }}
              >
                {currentTenant.name}
              </h2>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                {currentTenant.domain}
              </p>
            </div>
          </div>

          {/* Tenant switcher */}
          <select
            value={currentTenant.id}
            onChange={(e) => {
              const tenant = availableTenants.find(
                (t) => t.id === e.target.value
              );
              if (tenant) switchTenant(tenant);
            }}
            className="w-full p-2.5 rounded-lg border transition-all duration-200 text-xs font-medium"
            style={{
              backgroundColor: theme.background,
              borderColor: currentTenant.theme.border,
              color: theme.text,
            }}
          >
            {availableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                Switch to {tenant.name}
              </option>
            ))}
          </select>
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: currentTenant.theme.primary }}
          >
            A
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
