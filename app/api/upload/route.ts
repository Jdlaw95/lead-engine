import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Service role client — bypasses RLS for server-side file uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const MAX_FILES = 5
const BUCKET = 'lead-files'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const businessId = formData.get('businessId')
    const files = formData.getAll('files') as File[]

    if (!businessId || typeof businessId !== 'string') {
      return NextResponse.json({ error: 'Missing business ID' }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per submission` },
        { status: 400 }
      )
    }

    const urls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${businessId}/${randomUUID()}.${ext}`
      const buffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        console.error('[upload] Storage error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        )
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('[upload] Unexpected error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
