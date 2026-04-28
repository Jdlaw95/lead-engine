import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
}

/**
 * Sends an email via Resend.
 * Returns the Resend message ID on success, null on failure.
 * Errors are logged but never thrown — email failure should not break lead capture.
 */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  try {
    const { data, error } = await resend.emails.send({
      to: options.to,
      from: options.from,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      console.error('[Resend] Send error:', error)
      return null
    }

    return data?.id ?? null
  } catch (err) {
    console.error('[Resend] Unexpected error:', err)
    return null
  }
}
