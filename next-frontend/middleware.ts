import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

// List of domains that should not be treated as tenants
const EXCLUDED_SUBDOMAINS = ["www", "admin", "api", "mail", "ftp"];

// Main domain configuration
const MAIN_DOMAIN = "analytics.fintyhive.com";

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

  // Skip auth check for API routes
  if (pathname.startsWith("/api/")) {
    console.log("🔗 API route - skipping auth");
    return NextResponse.next();
  }

  // If no subdomain or excluded subdomain, continue without tenant header (root domain)
  if (!subdomain || EXCLUDED_SUBDOMAINS.includes(subdomain)) {
    console.log("📄 No tenant context - showing main app");
    return NextResponse.next();
  }

  // 🔐 AUTHENTICATION CHECK FOR SUBDOMAINS
  console.log("🔐 Checking authentication for subdomain:", subdomain);

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    console.log("❌ No auth token - redirecting to login");
    // No token - redirect to root domain (login page)
    const loginUrl = new URL("/", request.url);
    loginUrl.hostname = MAIN_DOMAIN; // Redirect to main domain
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as any;
    console.log("✅ Token valid for tenant:", decoded.tenantSlug);

    // Check if token's tenant matches the subdomain
    if (decoded.tenantSlug !== subdomain) {
      console.log("❌ Token tenant mismatch - redirecting to login");
      // Token doesn't match subdomain - redirect to login
      const loginUrl = new URL("/", request.url);
      loginUrl.hostname = MAIN_DOMAIN; // Redirect to main domain
      return NextResponse.redirect(loginUrl);
    }

    // ✅ VALID AUTHENTICATION - Add tenant context to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-slug", subdomain);
    requestHeaders.set("x-tenant-id", decoded.tenantId);
    requestHeaders.set("x-tenant-name", decoded.tenantName);
    requestHeaders.set("x-website-id", decoded.websiteId);

    console.log("✅ Authenticated tenant access:", subdomain);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log("❌ JWT verification failed - redirecting to login");
    // Invalid token - redirect to login
    const loginUrl = new URL("/", request.url);
    loginUrl.hostname = MAIN_DOMAIN; // Redirect to main domain
    return NextResponse.redirect(loginUrl);
  }
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

  // For production: check if this is the main domain
  if (host === MAIN_DOMAIN) {
    console.log("🔍 Main domain detected:", host);
    return null; // No subdomain for main domain
  }

  // Check if this is a tenant subdomain (tenant.analytics.fintyhive.com)
  if (host.endsWith(`.${MAIN_DOMAIN}`)) {
    const subdomain = host.replace(`.${MAIN_DOMAIN}`, "");
    console.log("🔍 Tenant subdomain detected:", subdomain);
    return subdomain;
  }

  // For other domains, use the old logic as fallback
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
