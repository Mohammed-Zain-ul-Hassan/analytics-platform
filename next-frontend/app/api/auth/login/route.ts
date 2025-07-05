import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

// Database connection helper
async function validateTenant(tenantSlug: string, password: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenants?where[slug][equals]=${tenantSlug}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            process.env.PAYLOAD_API_KEY || process.env.PAYLOAD_SECRET
          }`,
        },
      }
    );

    if (!response.ok) {
      return { valid: false, tenant: null };
    }

    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const tenant = data.docs[0];

      // Check if password matches (this should be hashed in production)
      if (tenant.password === password) {
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
    const { tenantSlug, password } = body;

    // Validate input
    if (!tenantSlug || !password) {
      return NextResponse.json(
        { error: "Tenant slug and password are required" },
        { status: 400 }
      );
    }

    // Validate tenant and password
    const { valid, tenant } = await validateTenant(tenantSlug, password);

    if (!valid || !tenant) {
      return NextResponse.json(
        { error: "Invalid tenant or password" },
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
