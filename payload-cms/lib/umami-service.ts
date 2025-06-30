// lib/umami-service.ts

import type { Tenant } from '../src/payload-types'

const UMAMI_API_URL = process.env.UMAMI_API_URL // https://umami.analytics.fintyhive.com
const UMAMI_USERNAME = process.env.UMAMI_USERNAME // admin
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD // your password

interface UmamiWebsiteResponse {
  success: boolean
  websiteId?: string
  data?: any
  error?: string
  wasExisting?: boolean
}

export async function createUmamiWebsite(tenantData: Tenant): Promise<UmamiWebsiteResponse> {
  try {
    console.log('Creating Umami website for tenant:', tenantData.name)

    // Step 1: Get authentication token
    const authResponse = await fetch(`${UMAMI_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: UMAMI_USERNAME,
        password: UMAMI_PASSWORD,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    console.log('Got Umami auth token successfully')

    // Step 2: Check if website already exists
    const existingWebsitesResponse = await fetch(`${UMAMI_API_URL}/api/websites`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (existingWebsitesResponse.ok) {
      const existingWebsites = await existingWebsitesResponse.json()
      const domainToCheck = `${tenantData.slug}.analytics.fintyhive.com`

      const existingWebsite = existingWebsites.data?.find(
        (site: any) => site.domain === domainToCheck || site.name === tenantData.name,
      )

      if (existingWebsite) {
        console.log('Website already exists, returning existing:', existingWebsite)
        return {
          success: true,
          websiteId: existingWebsite.id,
          data: existingWebsite,
          wasExisting: true,
        }
      }
    }

    // Step 3: Create website in Umami
    const websiteResponse = await fetch(`${UMAMI_API_URL}/api/websites`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tenantData.name,
        domain: `${tenantData.slug}.analytics.fintyhive.com`,
      }),
    })

    if (!websiteResponse.ok) {
      throw new Error(`Website creation failed: ${websiteResponse.status}`)
    }

    const websiteData = await websiteResponse.json()

    console.log('Umami website created:', websiteData)

    return {
      success: true,
      websiteId: websiteData.id,
      data: websiteData,
    }
  } catch (error) {
    console.error('Error creating Umami website:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
