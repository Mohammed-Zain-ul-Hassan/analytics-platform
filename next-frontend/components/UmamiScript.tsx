"use client";

import { useTenant } from "../contexts/TenantContext";
import { useEffect } from "react";

export default function UmamiScript() {
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant?.umamiWebsiteId) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.setAttribute("data-website-id", currentTenant.umamiWebsiteId);
      script.src = "https://umami.analytics.fintyhive.com/script.js";
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [currentTenant?.umamiWebsiteId]);

  return null;
}
