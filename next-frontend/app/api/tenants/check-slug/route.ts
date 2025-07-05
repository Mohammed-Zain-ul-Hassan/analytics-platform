import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: "Slug can only contain lowercase letters, numbers, and hyphens",
      });
    }

    // Check if slug is too short
    if (slug.length < 3) {
      return NextResponse.json({
        available: false,
        error: "Slug must be at least 3 characters long",
      });
    }

    // Check if slug is too long
    if (slug.length > 50) {
      return NextResponse.json({
        available: false,
        error: "Slug must be less than 50 characters",
      });
    }

    // Check reserved slugs
    const reservedSlugs = [
      "admin",
      "api",
      "app",
      "auth",
      "dashboard",
      "login",
      "register",
      "www",
      "mail",
      "ftp",
      "blog",
      "help",
      "support",
      "docs",
      "status",
    ];

    if (reservedSlugs.includes(slug)) {
      return NextResponse.json({
        available: false,
        error: "This slug is reserved",
      });
    }

    // Check if tenant already exists with this slug (NO AUTH HEADER)
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://admin.analytics.fintyhive.com";

    const response = await fetch(
      `${apiUrl}/api/tenants?where[slug][equals]=${slug}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check slug availability" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const isAvailable = !data.docs || data.docs.length === 0;

    return NextResponse.json({
      available: isAvailable,
      slug: slug,
    });
  } catch (error) {
    console.error("Slug check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
