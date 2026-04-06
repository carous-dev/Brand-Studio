import { NextRequest, NextResponse } from 'next/server'
import { ensureConversation, getRecentMessages, insertChatMessage } from '@/app/lib/support-conversation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params
    const conversation = ensureConversation(visitorId)
    const messages = getRecentMessages(visitorId)

    return NextResponse.json({
      success: true,
      conversation,
      messages
    })
  } catch (error) {
    console.error('[GET /api/conversations/[visitorId]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params
    const body = await request.json()
    const { message, response } = body

    if (!message || !response) {
      return NextResponse.json(
        { error: 'Message and response are required' },
        { status: 400 }
      )
    }

    const chatMessage = insertChatMessage(visitorId, message, response)

    return NextResponse.json({
      success: true,
      message: chatMessage
    })
  } catch (error) {
    console.error('[POST /api/conversations/[visitorId]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  try {
    const { visitorId } = await params
    
    // Import the delete function
    const { deleteConversation } = await import('@/app/lib/support-conversation')
    const deleted = deleteConversation(visitorId)

    return NextResponse.json({
      success: true,
      deleted
    })
  } catch (error) {
    console.error('[DELETE /api/conversations/[visitorId]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}