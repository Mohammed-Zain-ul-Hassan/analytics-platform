import { CollectionConfig } from 'payload'
import { createUmamiWebsite } from '../../lib/umami-service'

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
      name: 'umamiWebsiteId',
      type: 'text',
      label: 'Umami Website ID',
      admin: {
        //readOnly: true,
        description: 'Auto-generated when tenant is created',
      },
    },
    {
      name: 'domain',
      type: 'text',
      label: 'Custom Domain (Optional)',
      admin: {
        description: 'e.g., analytics.clientdomain.com',
      },
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Branding Settings',
      fields: [
        {
          name: 'brandColor',
          type: 'text',
          defaultValue: '#3B82F6',
          label: 'Brand Color',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Pending', value: 'pending' },
      ],
      defaultValue: 'active',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req, context }) => {
        // Prevent infinite loops
        if (context.skipUmamiHook || operation !== 'create') {
          return
        }

        console.log('New tenant created, setting up Umami website...')

        const umamiResult = await createUmamiWebsite(doc)

        if (umamiResult.success) {
          console.log('Umami website created successfully!')

          // Pass req to use the same database transaction
          await req.payload.update({
            collection: 'tenants',
            id: doc.id,
            data: {
              umamiWebsiteId: umamiResult.websiteId,
            },
            req, // ← This is the missing piece!
            context: {
              ...context,
              skipUmamiHook: true, // Prevent infinite loop
            },
          })

          console.log('Tenant updated with Umami website ID:', umamiResult.websiteId)
        } else {
          console.error('Failed to create Umami website:', umamiResult.error)
        }
      },
    ],
  },
}

export default Tenants
