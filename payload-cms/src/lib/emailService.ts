import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  email: string
  firstName: string
  lastName: string
  tenantSlug: string
  tenantName: string
  generatedPassword: string
  websiteId?: string // Add website ID
  tenantPassword?: string // Add tenant password
}

export async function sendApprovalEmail(userData: EmailData) {
  try {
    console.log('🔄 Sending approval email to:', userData.email)

    // Generate tracking script
    const trackingScript = `<script\n  async\n  defer\n  data-website-id=\"${userData.websiteId || 'YOUR_WEBSITE_ID'}\"\n  src=\"https://umami.analytics.fintyhive.com/script.js\">\n</script>`

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: userData.email,
      subject: '🎉 Welcome to Analytics Platform - Account Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 30px; border-radius: 12px; color: white;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px;">🎉 Welcome Aboard!</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your Analytics Platform account is ready</p>
          </div>
          
          <!-- Login Credentials -->
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="color: #1e293b; margin-bottom: 20px; display: flex; align-items: center;">
              🔐 Your Login Credentials
            </h2>
            <p style="color: #475569; margin-bottom: 20px;">
              Hello <strong>${userData.firstName}</strong>, your account for <strong>${userData.tenantName}</strong> has been approved!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Organization:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${userData.tenantSlug}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">User Password:</td>
                  <td style="padding: 8px 0;"><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #dc2626;">${userData.generatedPassword}</code></td>
                </tr>
                ${userData.tenantPassword ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Tenant Password:</td><td style="padding: 8px 0;"><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #2563eb;">${userData.tenantPassword}</code></td></tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Login URL:</td>
                  <td style="padding: 8px 0;"><a href="https://analytics.fintyhive.com" style="color: #2563eb; text-decoration: none;">analytics.fintyhive.com</a></td>
                </tr>
                ${userData.websiteId ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Website ID:</td><td style="padding: 8px 0;"><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${userData.websiteId}</code></td></tr>` : ''}
              </table>
            </div>
          </div>

          <!-- Quick Start Guide -->
          <div style="background: #fef3c7; padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h2 style="color: #92400e; margin-bottom: 20px; display: flex; align-items: center;">
              🚀 Quick Start Guide
            </h2>
            
            <div style="color: #78350f; line-height: 1.6;">
              <p style="margin-bottom: 15px;"><strong>Step 1:</strong> 
                <a href="https://analytics.fintyhive.com" style="color: #2563eb;">Login to your dashboard</a>
              </p>
              <p style="margin-bottom: 15px;"><strong>Step 2:</strong> Add the tracking script to your website (see below)</p>
              <p style="margin-bottom: 15px;"><strong>Step 3:</strong> Start monitoring your website traffic!</p>
            </div>
          </div>

          ${
            userData.websiteId
              ? `
          <!-- Tracking Script -->
          <div style="background: #ecfdf5; padding: 30px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="color: #065f46; margin-bottom: 20px; display: flex; align-items: center;">
              📊 Install Tracking Code
            </h2>
            <p style="color: #047857; margin-bottom: 15px;">
              Add this code to your website's <code>&lt;head&gt;</code> section to start tracking:
            </p>
            
            <div style="background: #1f2937; color: #10b981; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; overflow-x: auto; margin: 15px 0;">
              <div style="color: #6b7280; margin-bottom: 10px;"><!-- Add this to your website's &lt;head&gt; section --></div>
${trackingScript}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 0; color: #047857; font-size: 14px;">
                💡 <strong>Tip:</strong> Once installed, you'll see real-time visitor data in your dashboard within minutes!
              </p>
            </div>
          </div>
          `
              : ''
          }

          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://analytics.fintyhive.com" 
               style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);">
              🎯 Access Your Dashboard
            </a>
          </div>

          <!-- Useful Links -->
          <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">📚 Helpful Resources</h3>
            <div style="color: #475569; line-height: 1.8;">
              <p style="margin: 8px 0;">
                🔗 <a href="https://${userData.tenantSlug}.analytics.fintyhive.com" style="color: #2563eb;">Your Personal Dashboard</a>
              </p>
              <p style="margin: 8px 0;">
                🛠️ <a href="https://umami.is/docs" style="color: #2563eb;">Analytics Documentation</a>
              </p>
              <p style="margin: 8px 0;">
                💬 Need help? Reply to this email for support
              </p>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="color: #dc2626; font-size: 14px; margin: 0; font-weight: 500;">
                🔒 <strong>Security Reminder:</strong> Please change your password after your first login for better security.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
              This email was sent because your account was approved by an administrator.<br>
              Analytics Platform • Powered by Umami Analytics
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Enhanced approval email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('❌ Email service error:', error)
    return { success: false, error: error.message }
  }
}
