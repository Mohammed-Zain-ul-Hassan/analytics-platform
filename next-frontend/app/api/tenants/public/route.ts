import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Fetch tenants from Payload CMS (NO AUTH HEADER)
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://admin.analytics.fintyhive.com";
    const response = await fetch(`${apiUrl}/api/tenants?limit=100`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tenants");
    }

    const data = await response.json();

    // Return only public tenant information (no sensitive data)
    const publicTenants = data.docs.map((tenant: any) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
    }));

    return NextResponse.json({
      tenants: publicTenants,
    });
  } catch (error) {
    console.error("❌ Public tenants API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}
