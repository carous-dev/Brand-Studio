import { NextRequest, NextResponse } from 'next/server'
import { getAllConversations } from '@/app/lib/support-conversation'

export async function GET(request: NextRequest) {
  try {
    const conversations = getAllConversations()

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length
    })
  } catch (error) {
    console.error('[GET /api/conversations] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId } = body

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      )
    }

    // Import ensureConversation function
    const { ensureConversation } = await import('@/app/lib/support-conversation')
    const conversation = ensureConversation(visitorId)

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error('[POST /api/conversations] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}