interface NotificationEmailProps {
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone?: string
  service?: string
  message?: string
  metadata?: Record<string, unknown>
  fileUrls?: string[]
  dashboardUrl: string
}

/**
 * HTML email sent to the business owner when a new lead is submitted.
 */
export function notificationEmailHtml({
  businessName,
  leadName,
  leadEmail,
  leadPhone,
  service,
  message,
  metadata,
  fileUrls,
  dashboardUrl,
}: NotificationEmailProps): string {
  const metadataRows = metadata
    ? Object.entries(metadata)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(
          ([key, value]) => `
          <tr>
            <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; text-transform: capitalize; vertical-align: top;">
              ${key.replace(/_/g, ' ')}
            </td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${value}</td>
          </tr>`
        )
        .join('')
    : ''

  const filesSection =
    fileUrls && fileUrls.length > 0
      ? `
      <div style="margin-top: 28px;">
        <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px; font-weight: 600;">
          Attached Files
        </p>
        ${fileUrls
          .map(
            (url) =>
              `<a href="${url}" style="display: block; color: #2563eb; font-size: 14px; margin-bottom: 6px; text-decoration: none;">
                📎 ${url.split('/').pop()}
              </a>`
          )
          .join('')}
      </div>`
      : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead — ${businessName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <div style="background-color: #111827; padding: 24px 32px;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
        New Lead
      </p>
      <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
        ${businessName}
      </h1>
    </div>

    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; vertical-align: top; width: 110px;">Name</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; vertical-align: top;">Email</td>
          <td style="padding: 8px 0; font-size: 14px;">
            <a href="mailto:${leadEmail}" style="color: #2563eb; text-decoration: none;">${leadEmail}</a>
          </td>
        </tr>
        ${
          leadPhone
            ? `<tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; vertical-align: top;">Phone</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${leadPhone}</td>
        </tr>`
            : ''
        }
        ${
          service
            ? `<tr>
          <td style="padding: 8px 16px 8px 0; color: #6b7280; font-size: 14px; white-space: nowrap; vertical-align: top;">Service</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${service}</td>
        </tr>`
            : ''
        }
        ${metadataRows}
      </table>

      ${
        message
          ? `<div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px; font-weight: 600;">Message</p>
          <p style="color: #111827; font-size: 14px; line-height: 1.7; margin: 0;">${message}</p>
        </div>`
          : ''
      }

      ${filesSection}

      <div style="margin-top: 32px;">
        <a
          href="${dashboardUrl}"
          style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 7px; text-decoration: none; font-size: 14px; font-weight: 500;"
        >
          View Lead in Dashboard →
        </a>
      </div>
    </div>

  </div>
</body>
</html>
  `.trim()
}
