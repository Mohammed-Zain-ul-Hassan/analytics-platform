import { NextRequest, NextResponse } from "next/server";

// List of domains that should not be treated as tenants
const EXCLUDED_SUBDOMAINS = ["www", "admin", "api", "mail", "ftp"];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  console.log("🔍 Middleware:", { hostname, pathname });

  // Extract subdomain
  const subdomain = extractSubdomain(hostname);
  console.log("🏢 Detected subdomain:", subdomain);

  // For static files, skip processing
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  // If no subdomain or excluded subdomain, continue without tenant header
  if (!subdomain || EXCLUDED_SUBDOMAINS.includes(subdomain)) {
    console.log("📄 No tenant context");
    return NextResponse.next();
  }

  // Add tenant context to headers (including for API routes!)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", subdomain);
  console.log("✅ Added tenant header:", subdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(":")[0];
  const parts = host.split(".");

  // For localhost development - handle subdomains like test.localhost
  if (host.includes("localhost")) {
    if (parts.length >= 2 && parts[0] !== "localhost") {
      console.log("🔍 Localhost subdomain detected:", parts[0]);
      return parts[0]; // Return 'test' from 'test.localhost'
    }
    return null; // Just 'localhost' without subdomain
  }

  // For 127.0.0.1 development
  if (host.includes("127.0.0.1")) {
    return null;
  }

  // For production (subdomain.analytics.fintyhive.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
