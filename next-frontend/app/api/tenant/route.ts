import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  console.log("🔍 API: Looking for tenant:", tenantSlug);

  if (!tenantSlug) {
    return NextResponse.json({ error: "No tenant specified" }, { status: 400 });
  }

  try {
    // Fetch tenant from Payload CMS
    const response = await fetch(
      `http://localhost:3001/api/tenants?where[slug][equals]=${tenantSlug}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenant");
    }

    const data = await response.json();
    console.log("📊 Payload response:", data);

    if (data.docs.length === 0) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const tenant = data.docs[0];

    // Return tenant data
    return NextResponse.json({
      id: tenant.slug,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain || "",
      umamiWebsiteId: tenant.umamiWebsiteId,
      theme: {
        primary: tenant.settings?.brandColor || "#3B82F6",
        // Add other theme properties as needed
      },
      settings: tenant.settings || { brandColor: "#3B82F6" },
      status: tenant.status,
    });
  } catch (error) {
    console.error("❌ Tenant API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}
