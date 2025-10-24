import { Resend } from 'resend'

// Initialize Resend with API key from environment
// Use a placeholder key if not set (for build time)
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key')

// Default sender email
export const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@fireflygrove.app'
export const SENDER_NAME = 'Firefly Grove'

// Helper to check if Resend is configured
export const isResendConfigured = () => {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder_key'
}
