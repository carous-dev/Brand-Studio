import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params

    // Database functionality removed
    return NextResponse.json({ error: 'Database functionality has been disabled' }, { status: 503 })
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params
    const body = await request.json()
    const { text, from: bodyFrom, senderId, clientMessageId } = body

    // Database functionality removed
    return NextResponse.json({ error: 'Database functionality has been disabled' }, { status: 503 })
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}

  
  