"use client";

import React, { useState } from "react";
import { Palette, RotateCcw, Check, Eye } from "lucide-react";
import { useTenant } from "../contexts/TenantContext";
import { colorPresets } from "../contexts/TenantContext";

const Settings: React.FC = () => {
  const { currentTenant, isDarkMode, updateTenantColors, resetTenantColors } =
    useTenant();
  const [selectedColors, setSelectedColors] = useState({
    primary: currentTenant?.theme.primary || "#3B82F6",
    secondary: currentTenant?.theme.secondary || "#8B5CF6",
    accent: currentTenant?.theme.accent || "#06B6D4",
  });
  const [showPreview, setShowPreview] = useState(false);

  if (!currentTenant) {
    return (
      <div className="rounded-xl border p-10">
        <div className="text-center text-gray-500">
          <p>No tenant data available</p>
        </div>
      </div>
    );
  }

  const theme = isDarkMode ? currentTenant.theme.dark : currentTenant.theme;

  const handleColorChange = (
    colorType: "primary" | "secondary" | "accent",
    color: string
  ) => {
    setSelectedColors((prev) => ({
      ...prev,
      [colorType]: color,
    }));
  };

  const handleSaveColors = () => {
    updateTenantColors(selectedColors);
    setShowPreview(false);
  };

  const handleResetColors = () => {
    resetTenantColors();
    setSelectedColors({
      primary: currentTenant.theme.primary,
      secondary: currentTenant.theme.secondary,
      accent: currentTenant.theme.accent,
    });
    setShowPreview(false);
  };

  const handlePresetSelect = (preset: (typeof colorPresets)[0]) => {
    setSelectedColors({
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
    });
    setShowPreview(true);
  };

  return (
    <div
      className="p-10 min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.background }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text }}>
            Settings
          </h1>
          <p className="text-lg" style={{ color: theme.textSecondary }}>
            Customize your analytics dashboard experience
          </p>
        </div>

        {/* Brand Customization Section */}
        <div
          className="rounded-2xl border p-8 mb-8"
          style={{
            backgroundColor: theme.surface,
            borderColor: currentTenant.theme.border,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${currentTenant.theme.primary}15` }}
            >
              <Palette
                className="w-6 h-6"
                style={{ color: currentTenant.theme.primary }}
              />
            </div>
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: theme.text }}
              >
                Brand Customization
              </h2>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Customize colors to match your brand identity
              </p>
            </div>
          </div>

          {/* Color Presets */}
          <div className="mb-8">
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: theme.text }}
            >
              Quick Presets
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="group relative p-4 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: theme.background,
                    borderColor:
                      selectedColors.primary === preset.primary
                        ? preset.primary
                        : currentTenant.theme.border,
                    borderWidth:
                      selectedColors.primary === preset.primary ? "2px" : "1px",
                  }}
                >
                  <div className="flex space-x-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.text }}
                  >
                    {preset.name}
                  </span>
                  {selectedColors.primary === preset.primary && (
                    <div className="absolute -top-1 -right-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: preset.primary }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="mb-8">
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: theme.text }}
            >
              Custom Colors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  key: "primary" as const,
                  label: "Primary Color",
                  description: "Main brand color",
                },
                {
                  key: "secondary" as const,
                  label: "Secondary Color",
                  description: "Supporting color",
                },
                {
                  key: "accent" as const,
                  label: "Accent Color",
                  description: "Highlight color",
                },
              ].map((colorConfig) => (
                <div key={colorConfig.key} className="space-y-3">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: theme.text }}
                    >
                      {colorConfig.label}
                    </label>
                    <p
                      className="text-xs"
                      style={{ color: theme.textSecondary }}
                    >
                      {colorConfig.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors[colorConfig.key]}
                      onChange={(e) => {
                        handleColorChange(colorConfig.key, e.target.value);
                        setShowPreview(true);
                      }}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                      style={{ borderColor: currentTenant.theme.border }}
                    />
                    <input
                      type="text"
                      value={selectedColors[colorConfig.key]}
                      onChange={(e) => {
                        handleColorChange(colorConfig.key, e.target.value);
                        setShowPreview(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: currentTenant.theme.border,
                        color: theme.text,
                      }}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="mb-8">
              <h3
                className="text-lg font-medium mb-4"
                style={{ color: theme.text }}
              >
                Live Preview
              </h3>
              <div
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: theme.background,
                  borderColor: currentTenant.theme.border,
                }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${selectedColors.primary}20` }}
                  >
                    <Eye
                      className="w-6 h-6"
                      style={{ color: selectedColors.primary }}
                    />
                  </div>
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: theme.text }}
                    >
                      2.4M
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      Page Views
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: selectedColors.primary }}
                  />
                  <div
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: selectedColors.secondary }}
                  />
                  <div
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: selectedColors.accent }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSaveColors}
              disabled={!showPreview}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: showPreview
                  ? selectedColors.primary
                  : currentTenant.theme.border,
                color: showPreview ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              Save Changes
            </button>
            <button
              onClick={handleResetColors}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center space-x-2"
              style={{
                backgroundColor: `${currentTenant.theme.error}15`,
                color: currentTenant.theme.error,
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: theme.surface,
            borderColor: currentTenant.theme.border,
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: theme.text }}
          >
            Dashboard Preferences
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" style={{ color: theme.text }}>
                  Real-time Updates
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Enable live data updates every 30 seconds
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: currentTenant.theme.border,
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
