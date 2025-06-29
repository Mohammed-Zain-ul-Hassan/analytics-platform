"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Tenant, TenantTheme, ColorPreset } from "../types/tenant";

interface TenantContextType {
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
  switchTenant: (tenant: Tenant) => void;
  availableTenants: Tenant[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  updateTenantColors: (colors: {
    primary: string;
    secondary: string;
    accent: string;
  }) => void;
  resetTenantColors: () => void;
  currentView: "dashboard" | "settings";
  setCurrentView: (view: "dashboard" | "settings") => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Enhanced tenant themes with dark mode support
const tenantThemes: Record<string, TenantTheme> = {
  modern: {
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#06B6D4",
    background: "#FAFBFC",
    surface: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    dark: {
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F1F5F9",
      textSecondary: "#94A3B8",
      border: "#334155",
    },
  },
  robinhood: {
    primary: "#00C805",
    secondary: "#FF6B35",
    accent: "#1DB954",
    background: "#FAFBFC",
    surface: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#00C805",
    warning: "#FF6B35",
    error: "#FF4757",
    dark: {
      background: "#0D1117",
      surface: "#161B22",
      text: "#F0F6FC",
      textSecondary: "#8B949E",
      border: "#30363D",
    },
  },
  notion: {
    primary: "#2563EB",
    secondary: "#7C3AED",
    accent: "#059669",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    dark: {
      background: "#111827",
      surface: "#1F2937",
      text: "#F9FAFB",
      textSecondary: "#9CA3AF",
      border: "#374151",
    },
  },
};

// Fallback tenant for when no subdomain is detected
const defaultTenants: Tenant[] = [
  {
    id: "acme-corp",
    name: "Acme Analytics",
    logo: "Building2",
    domain: "acme.com",
    theme: tenantThemes.modern,
  },
  {
    id: "tech-startup",
    name: "TechFlow",
    logo: "Zap",
    domain: "techflow.io",
    theme: tenantThemes.robinhood,
  },
  {
    id: "creative-agency",
    name: "Creative Studio",
    logo: "Palette",
    domain: "creativestudio.com",
    theme: tenantThemes.notion,
  },
];

export const colorPresets: ColorPreset[] = [
  { name: "Blue", primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4" },
  {
    name: "Green",
    primary: "#10B981",
    secondary: "#059669",
    accent: "#34D399",
  },
  {
    name: "Purple",
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#A78BFA",
  },
  {
    name: "Orange",
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#FBBF24",
  },
  { name: "Red", primary: "#EF4444", secondary: "#DC2626", accent: "#F87171" },
  { name: "Dark", primary: "#1F2937", secondary: "#374151", accent: "#4B5563" },
];

export const TenantProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeframe, setTimeframe] = useState("7d");
  const [currentView, setCurrentView] = useState<"dashboard" | "settings">(
    "dashboard"
  );

  // Fetch real tenant data on mount
  useEffect(() => {
    async function fetchTenant() {
      try {
        console.log("🔍 Fetching tenant data...");
        const response = await fetch("/api/tenant");

        if (response.ok) {
          const tenantData = await response.json();
          console.log("✅ Tenant data received:", tenantData);

          // Convert API response to full Tenant object with theme
          const fullTenant: Tenant = {
            id: tenantData.slug,
            name: tenantData.name,
            logo: "Building2", // Default logo, can be enhanced later
            domain:
              tenantData.domain || `${tenantData.slug}.analytics.fintyhive.com`,
            theme: {
              ...tenantThemes.modern, // Use modern theme as base
              primary:
                tenantData.settings?.brandColor || tenantThemes.modern.primary,
            },
            umamiWebsiteId: tenantData.umamiWebsiteId,
            settings: tenantData.settings,
            status: tenantData.status,
          };

          setCurrentTenant(fullTenant);
        } else if (response.status === 404) {
          console.log("📄 No tenant found, using default");
          setCurrentTenant(defaultTenants[0]); // Fallback to default
        } else if (response.status === 400) {
          console.log("🏠 No subdomain detected, using default");
          setCurrentTenant(defaultTenants[0]); // No subdomain = main page
        } else {
          setError("Failed to load tenant");
        }
      } catch (err) {
        console.error("❌ Tenant fetch error:", err);
        setError("Network error");
        setCurrentTenant(defaultTenants[0]); // Fallback on error
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();
  }, []);

  // Check system preference for dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const switchTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateTenantColors = (colors: {
    primary: string;
    secondary: string;
    accent: string;
  }) => {
    if (!currentTenant) return;

    const updatedTenant = {
      ...currentTenant,
      theme: {
        ...currentTenant.theme,
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
      },
    };
    setCurrentTenant(updatedTenant);
  };

  const resetTenantColors = () => {
    if (!currentTenant) return;

    const originalTheme = tenantThemes.modern; // Default to modern theme
    const updatedTenant = {
      ...currentTenant,
      theme: originalTheme,
    };
    setCurrentTenant(updatedTenant);
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        loading,
        error,
        switchTenant,
        availableTenants: defaultTenants,
        isDarkMode,
        toggleDarkMode,
        timeframe,
        setTimeframe,
        updateTenantColors,
        resetTenantColors,
        currentView,
        setCurrentView,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
