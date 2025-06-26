import { NextRequest, NextResponse } from "next/server";

// List of domains that should not be treated as tenants
const EXCLUDED_SUBDOMAINS = ["www", "admin", "api", "mail", "ftp"];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = extractSubdomain(hostname);

  // If no subdomain or excluded subdomain, show main page
  if (!subdomain || EXCLUDED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  // Add tenant context to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", subdomain);

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

  // For localhost development
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
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
