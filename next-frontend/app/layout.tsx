import "./globals.css";
import type { Metadata } from "next";
import { TenantProvider } from "../contexts/TenantContext";
import AppShell from "../components/AppShell";
import { useTenant } from "../contexts/TenantContext";
import { useEffect } from "react";

function UmamiScript() {
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

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "Multi-tenant analytics dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>
          <UmamiScript />
          <AppShell>{children}</AppShell>
        </TenantProvider>
      </body>
    </html>
  );
}
