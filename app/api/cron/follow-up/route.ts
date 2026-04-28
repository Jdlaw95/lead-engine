import { NextRequest, NextResponse } from 'next/server'
import { processFollowUps } from '@/lib/automation/follow-up'

/**
 * Cron endpoint — triggered by Vercel Cron on a schedule defined in vercel.json.
 *
 * Security: Vercel automatically sends the CRON_SECRET as a Bearer token
 * in the Authorization header. We verify it before processing anything.
 *
 * Can also be triggered manually for testing:
 *   curl -X GET http://localhost:3000/api/cron/follow-up \
 *     -H "Authorization: Bearer your_cron_secret"
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify the request is from Vercel Cron (or an authorised manual trigger)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[cron/follow-up] CRON_SECRET env variable is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processFollowUps()

    console.log('[cron/follow-up] Run complete:', result)

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (err) {
    console.error('[cron/follow-up] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
