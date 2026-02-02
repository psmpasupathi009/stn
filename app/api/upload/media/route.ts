import { NextRequest, NextResponse } from 'next/server'
import { uploadMedia } from '@/lib/cloudinary'
import { getSessionFromRequest } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadMedia(buffer, 'gallery')
    return NextResponse.json({ url })
  } catch (error: unknown) {
    console.error('Media upload error:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
