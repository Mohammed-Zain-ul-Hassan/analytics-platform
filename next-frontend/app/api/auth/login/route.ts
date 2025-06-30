import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

// Database connection helper
async function validateTenant(tenantSlug: string, websiteId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenants?where[slug][equals]=${tenantSlug}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { valid: false, tenant: null };
    }

    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const tenant = data.docs[0];

      // Check if website ID matches
      if (tenant.umamiWebsiteId === websiteId) {
        return { valid: true, tenant };
      }
    }

    return { valid: false, tenant: null };
  } catch (error) {
    console.error("Tenant validation error:", error);
    return { valid: false, tenant: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, websiteId } = body;

    // Validate input
    if (!tenantSlug || !websiteId) {
      return NextResponse.json(
        { error: "Tenant slug and website ID are required" },
        { status: 400 }
      );
    }

    // Validate tenant and website ID
    const { valid, tenant } = await validateTenant(tenantSlug, websiteId);

    if (!valid || !tenant) {
      return NextResponse.json(
        { error: "Invalid tenant or website ID" },
        { status: 401 }
      );
    }

    // Create JWT token
    const tokenPayload = {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      websiteId: tenant.umamiWebsiteId,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "fallback-secret-key"
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
