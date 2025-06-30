"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [isRootDomain, setIsRootDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTenant, loading, error } = useTenant();

  useEffect(() => {
    // Check if we're on the root domain
    const hostname = window.location.hostname;
    const isRoot =
      hostname === "analytics.fintyhive.com" || hostname === "localhost";
    setIsRootDomain(isRoot);
    setIsLoading(false);
  }, []);

  // Show loading while determining domain
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Root domain = show login form
  if (isRootDomain) {
    return <LoginForm />;
  }

  // Subdomain = show dashboard (with existing error handling)
  return <Dashboard />;
}
