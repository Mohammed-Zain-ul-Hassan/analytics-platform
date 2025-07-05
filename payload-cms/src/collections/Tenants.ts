import { CollectionConfig } from 'payload'
import { createUmamiWebsite } from '../../lib/umami-service'

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Frontend needs to read tenants for registration dropdowns
      // Admin needs to read tenants for management
      return true // Allow public read for registration + admin read
    },
    create: ({ req: { user } }) => {
      // Two scenarios:
      // 1. Frontend registration creates pending tenants = ALLOW
      // 2. Admin dashboard creates active tenants = ALLOW only for admins

      if (!user) {
        // Frontend registration = ALLOW
        return true
      } else {
        // Admin dashboard = require admin role
        return user.role === 'admin'
      }
    },
    update: ({ req: { user } }) => {
      // Only admins can update tenants
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete tenants
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tenant Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Subdomain (slug)',
      admin: {
        description: 'This becomes subdomain.analytics.fintyhive.com',
      },
    },
    {
      name: 'password',
      type: 'text',
      required: true,
      label: 'Tenant Password',
      admin: {
        description: 'Password for tenant login',
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: false, // Changed to false to avoid schema conflicts
      label: 'Website URL',
      admin: {
        description: 'The website URL to track',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'umamiWebsiteId',
      type: 'text',
      label: 'Umami Website ID',
      admin: {
        description: 'Auto-generated when tenant is approved',
        readOnly: true,
      },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'brandColor',
          type: 'text',
          defaultValue: '#3B82F6',
          label: 'Brand Color',
          admin: {
            description: 'Primary color for the tenant dashboard',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // If this is a new tenant being approved (status changed from pending to active)
        if (operation === 'update' && doc.status === 'active') {
          try {
            // Create Umami website if it doesn't exist
            if (!doc.umamiWebsiteId) {
              const umamiResult = await createUmamiWebsite(doc)

              if (umamiResult.success && umamiResult.websiteId) {
                // Update the tenant with the website ID
                await req.payload.update({
                  collection: 'tenants',
                  id: doc.id,
                  data: {
                    umamiWebsiteId: umamiResult.websiteId,
                  },
                })

                console.log(
                  `Umami website created for tenant ${doc.slug}: ${umamiResult.websiteId}`,
                )
              } else {
                console.error('Failed to create Umami website:', umamiResult.error)
              }
            }
          } catch (error) {
            console.error('Error creating Umami website:', error)
          }
        }
      },
    ],
  },
}

export default Tenants
