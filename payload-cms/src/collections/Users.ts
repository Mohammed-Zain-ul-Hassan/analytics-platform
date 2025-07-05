import { CollectionConfig } from 'payload'
import crypto from 'crypto'
import { sendApprovalEmail } from '../lib/emailService'

// Function to generate random password
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'tenant', 'status', 'createdAt'],
    listSearchableFields: ['email', 'firstName', 'lastName'],
    description: 'Manage platform users and administrators',
  },
  access: {
    read: ({ req: { user } }) => {
      // Only admins can read users (admin dashboard only)
      return user?.role === 'admin'
    },
    create: ({ req: { user } }) => {
      // Two scenarios:
      // 1. Frontend registration (no user session) = ALLOW
      // 2. Admin dashboard (authenticated admin) = ALLOW only for admins

      if (!user) {
        // No authenticated user = frontend registration = ALLOW
        return true
      } else {
        // Authenticated user = admin dashboard = require admin role
        return user.role === 'admin'
      }
    },
    update: ({ req: { user } }) => {
      // Only admins can update (admin dashboard only)
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete (admin dashboard only)
      return user?.role === 'admin'
    },
  },
  fields: [
    // BASIC INFO (Always visible)
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: 'First Name',
      admin: {
        description: 'Required for all users',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Last Name',
      admin: {
        description: 'Required for all users',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email Address',
      admin: {
        description: 'Must be unique across all users',
      },
    },

    // ROLE SELECTION (Always visible, determines other fields)
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      required: true,
      options: [
        {
          label: '👑 Administrator',
          value: 'admin',
        },
        {
          label: '👤 Regular User',
          value: 'user',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Select user type - this affects which fields are required',
      },
    },

    // TENANT (Only for regular users)
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      label: 'Organization',
      admin: {
        condition: (data) => data?.role === 'user',
        description: 'Required for regular users. Not applicable for administrators.',
      },
      validate: (value: unknown, { data }: { data: any }) => {
        // Require tenant only for regular users
        if (data?.role === 'user' && !value) {
          return 'Organization is required for regular users'
        }
        return true
      },
    },

    // STATUS (Only for regular users, only visible when EDITING existing users)
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        {
          label: '⏳ Pending Approval',
          value: 'pending',
        },
        {
          label: '✅ Approved',
          value: 'approved',
        },
        {
          label: '❌ Rejected',
          value: 'rejected',
        },
      ],
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { operation }) => {
          // Only show status field for users when EDITING (not creating)
          return data?.role === 'user' && operation === 'update'
        },
        description: 'Change approval status. Users start as pending automatically.',
      },
    },

    // MESSAGE (Only for regular users)
    {
      name: 'message',
      type: 'textarea',
      label: 'Registration Message',
      admin: {
        condition: (data) => data?.role === 'user',
        description: 'Optional message from user during registration',
      },
    },

    // GENERATED PASSWORD (Only for regular users, read-only)
    {
      name: 'generatedPassword',
      type: 'text',
      label: 'Generated Password',
      admin: {
        readOnly: true,
        condition: (data) => data?.role === 'user',
        position: 'sidebar',
        description: 'Auto-generated password sent to user upon approval',
      },
    },

    // APPROVAL TRACKING (Only for approved regular users)
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Approved By',
      admin: {
        readOnly: true,
        condition: (data) => data?.role === 'user' && data?.status === 'approved',
        position: 'sidebar',
        description: 'Administrator who approved this user',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      label: 'Approved At',
      admin: {
        readOnly: true,
        condition: (data) => data?.role === 'user' && data?.status === 'approved',
        position: 'sidebar',
        description: 'Date and time of approval',
      },
    },

    // ADMIN CREATION DATE (Only for admins)
    {
      name: 'adminCreatedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Created By Admin',
      admin: {
        readOnly: true,
        condition: (data) => data?.role === 'admin',
        position: 'sidebar',
        description: 'Administrator who created this admin account',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation, req, originalDoc }) => {
        const isAdmin = data?.role === 'admin'
        const isUser = data?.role === 'user'

        // ADMIN CREATION LOGIC
        if (operation === 'create' && isAdmin) {
          console.log('🔧 Creating new administrator:', data.email)

          // Admins don't need tenant, status, or message
          data.tenant = undefined
          data.status = undefined
          data.message = undefined
          data.generatedPassword = undefined

          // Track who created this admin
          if (req.user) {
            data.adminCreatedBy = req.user.id
          }
        }

        // USER CREATION LOGIC
        if (operation === 'create' && isUser) {
          console.log('🔧 Creating new user:', data.email)

          // Users ALWAYS start as pending (force it, don't show in UI)
          data.status = 'pending'

          // Don't generate password yet - wait for approval
          data.generatedPassword = undefined

          // Clear admin-only fields
          data.adminCreatedBy = undefined
        }

        // USER APPROVAL LOGIC
        if (operation === 'update' && isUser) {
          const wasApproved = originalDoc?.status !== 'approved' && data.status === 'approved'

          if (wasApproved) {
            console.log('🎯 User being approved:', data.email)

            // Set password to tenant password
            let tenantPassword = undefined
            if (data.tenant) {
              const tenant = await req.payload.findByID({
                collection: 'tenants',
                id: data.tenant,
              })
              tenantPassword = tenant?.password
            }
            data.generatedPassword = tenantPassword
            data.password = tenantPassword

            // Track approval details
            if (req.user) {
              data.approvedBy = req.user.id
              data.approvedAt = new Date()
            }
          }
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        const isUser = doc.role === 'user'
        const isNewlyApproved =
          operation === 'update' && previousDoc?.status !== 'approved' && doc.status === 'approved'

        // SEND APPROVAL EMAIL TO NEWLY APPROVED USERS
        if (isUser && isNewlyApproved) {
          console.log('📧 Sending approval email to:', doc.email)

          try {
            // Activate the tenant when user is approved
            if (doc.tenant) {
              await req.payload.update({
                collection: 'tenants',
                id: doc.tenant,
                data: {
                  status: 'active',
                },
              })
              console.log('🎯 Tenant activated for approved user:', doc.email)
            }

            // Get tenant information
            let tenant = null
            if (doc.tenant) {
              tenant = await req.payload.findByID({
                collection: 'tenants',
                id: doc.tenant,
              })
            }

            // Send approval email with credentials
            const emailResult = await sendApprovalEmail({
              email: doc.email,
              firstName: doc.firstName,
              lastName: doc.lastName,
              tenantSlug: tenant?.slug || 'unknown',
              tenantName: tenant?.name || 'Unknown Organization',
              generatedPassword: doc.generatedPassword,
              websiteId: tenant?.umamiWebsiteId || undefined,
            })

            if (emailResult.success) {
              console.log('✅ Approval email sent successfully to:', doc.email)
            } else {
              console.error('❌ Failed to send approval email:', emailResult.error)
            }
          } catch (error) {
            console.error('❌ Error in approval email process:', error)
          }
        }

        // LOG ADMIN CREATION
        if (operation === 'create' && doc.role === 'admin') {
          console.log('✅ New administrator created:', doc.email)
        }

        // LOG USER CREATION
        if (operation === 'create' && doc.role === 'user') {
          console.log('✅ New user created (pending approval):', doc.email)
        }
      },
    ],
  },
}

export default Users
