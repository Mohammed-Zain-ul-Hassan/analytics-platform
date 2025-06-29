import { CollectionConfig } from 'payload'

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
}

export default Tenants
