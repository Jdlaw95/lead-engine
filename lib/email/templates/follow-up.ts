interface FollowUpEmailProps {
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone?: string | null
  service?: string | null
  hoursAgo: number
  dashboardUrl: string
}

/**
 * Internal follow-up reminder sent to the business owner.
 * Fires when a lead has been sitting as 'new' past their configured followUpHours threshold.
 * Not sent to the lead — this is purely an internal nudge to the business owner.
 */
export function followUpEmailHtml({
  businessName,
  leadName,
  leadEmail,
  leadPhone,
  service,
  hoursAgo,
  dashboardUrl,
}: FollowUpEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <div style="background-color: #f59e0b; padding: 24px 32px;">
      <p style="color: #fffbeb; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
        Follow-up Reminder
      </p>
      <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
        ${businessName}
      </h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #111827; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        You have a lead that has been waiting for a response for
        <strong>${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''}</strong>.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; width: 80px;">Name</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;">
            <a href="mailto:${leadEmail}" style="color: #2563eb; text-decoration: none;">${leadEmail}</a>
          </td>
        </tr>
        ${
          leadPhone
            ? `<tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Phone</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${leadPhone}</td>
        </tr>`
            : ''
        }
        ${
          service
            ? `<tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap;">Service</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${service}</td>
        </tr>`
            : ''
        }
      </table>

      <a
        href="${dashboardUrl}"
        style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; border-radius: 7px; text-decoration: none; font-size: 14px; font-weight: 500;"
      >
        View & Respond →
      </a>

      <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; line-height: 1.6;">
        You will only receive one reminder per lead. Mark the lead as
        <em>Contacted</em> in your dashboard to stop reminders.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim()
}
