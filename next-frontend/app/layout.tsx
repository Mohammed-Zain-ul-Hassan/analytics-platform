import "./globals.css";
import type { Metadata } from "next";
import { TenantProvider } from "../contexts/TenantContext";
import AppShell from "../components/AppShell";
import UmamiScript from "../components/UmamiScript";

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
