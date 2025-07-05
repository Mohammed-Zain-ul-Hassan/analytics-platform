import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      companyName,
      desiredSlug,
      websiteUrl,
      message,
    } = body;

    // Validate input
    if (
      !firstName ||
      !lastName ||
      !email ||
      !companyName ||
      !desiredSlug ||
      !websiteUrl
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate website URL format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(websiteUrl)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid website URL starting with http:// or https://",
        },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(desiredSlug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://admin.analytics.fintyhive.com";

    // Check if slug is already taken (NO AUTH HEADER)
    const slugCheckResponse = await fetch(
      `${apiUrl}/api/tenants?where[slug][equals]=${desiredSlug}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (slugCheckResponse.ok) {
      const slugData = await slugCheckResponse.json();
      if (slugData.docs && slugData.docs.length > 0) {
        return NextResponse.json(
          { error: "This organization URL is already taken" },
          { status: 409 }
        );
      }
    }

    // Check if user already exists (NO AUTH HEADER)
    const existingUserResponse = await fetch(
      `${apiUrl}/api/users?where[email][equals]=${email}&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (existingUserResponse.ok) {
      const existingUserData = await existingUserResponse.json();
      if (existingUserData.docs && existingUserData.docs.length > 0) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Create pending tenant request (NO AUTH HEADER)
    const tenantData = {
      name: companyName,
      slug: desiredSlug,
      domain: websiteUrl,
      password: Math.random().toString(36).slice(-12), // Generate random password for tenant
      status: "pending", // Will be approved by admin
      settings: {
        brandColor: "#3B82F6", // Default blue
      },
      // Note: umamiWebsiteId will be created when admin approves
    };

    const createTenantResponse = await fetch(`${apiUrl}/api/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tenantData),
    });

    if (!createTenantResponse.ok) {
      const errorText = await createTenantResponse.text();
      console.error("Failed to create tenant:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to create tenant request" },
        { status: 500 }
      );
    }

    const createdTenant = await createTenantResponse.json();

    // Generate a random password for the user (required by Payload CMS)
    const randomPassword = Math.random().toString(36).slice(-12);

    // Create pending user request linked to the tenant (NO AUTH HEADER)
    const userData = {
      firstName,
      lastName,
      email,
      tenant: createdTenant.id,
      status: "pending", // Will be approved by admin
      message: message || "",
      role: "user", // Default to regular user for frontend registration
      password: randomPassword, // Required for Payload CMS auth:true
    };

    const createUserResponse = await fetch(`${apiUrl}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error("Failed to create user:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to create user request" },
        { status: 500 }
      );
    }

    const createdUser = await createUserResponse.json();

    // TODO: Send notification email to admin about new registration request
    // This would be handled by Payload CMS hooks

    return NextResponse.json({
      success: true,
      message: "Registration request created successfully",
      tenantId: createdTenant.id,
      userId: createdUser.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
