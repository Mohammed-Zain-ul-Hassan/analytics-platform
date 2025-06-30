"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isRootDomain, setIsRootDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isRoot =
      hostname === "analytics.fintyhive.com" || hostname === "localhost";
    setIsRootDomain(isRoot);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  if (isRootDomain) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
