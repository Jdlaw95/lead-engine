interface ConfirmationEmailProps {
  businessName: string
  leadName: string
  service?: string
  primaryColor: string
}

/**
 * HTML email sent to the lead confirming their enquiry was received.
 */
export function confirmationEmailHtml({
  businessName,
  leadName,
  service,
  primaryColor,
}: ConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enquiry Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <div style="background-color: ${primaryColor}; padding: 32px 40px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.3px;">
        ${businessName}
      </h1>
    </div>

    <div style="padding: 40px;">
      <h2 style="color: #111827; margin: 0 0 12px; font-size: 20px; font-weight: 600;">
        Thanks for reaching out, ${leadName}.
      </h2>

      <p style="color: #4b5563; line-height: 1.7; margin: 0 0 12px; font-size: 15px;">
        We've received your enquiry${service ? ` about <strong>${service}</strong>` : ''} and will be in touch with you shortly.
      </p>

      <p style="color: #4b5563; line-height: 1.7; margin: 0 0 32px; font-size: 15px;">
        If you have any urgent questions, just reply to this email.
      </p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          — The ${businessName} team
        </p>
      </div>
    </div>

  </div>
</body>
</html>
  `.trim()
}
