import { NextRequest, NextResponse } from 'next/server'
import { chatWithOllama, streamChatWithOllama, OllamaMessage } from '@/app/lib/ollama.service'
import { ensureConversation, getRecentMessages, insertChatMessage } from '@/app/lib/support-conversation'

type SupportPayload = {
  visitorId?: string | null
  text?: string | null
  visitorName?: string | null
  metadata?: {
    quickChatId?: string | null
    flowData?: Record<string, string | null | undefined>
  }
}

const DEFAULT_SYSTEM_PROMPT =
  process.env.SUPPORT_SYSTEM_PROMPT ||
  'You are the friendly support assistant for JD Car Sales (East Anglia) LTD. Answer clearly, politely, and keep messages concise while referencing the user by name when supplied.'

function buildContextString(payload: SupportPayload) {
  const parts: string[] = []
  if (payload.visitorName) {
    parts.push(`Visitor name: ${payload.visitorName}`)
  }
  if (payload.metadata?.quickChatId) {
    parts.push(`Active flow: ${payload.metadata.quickChatId}`)
  }
  const flowData = payload.metadata?.flowData
  if (flowData) {
    const flowEntries = Object.entries(flowData)
      .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
      .map(([key, value]) => `${key}: ${value?.toString().trim()}`)
      .slice(0, 6)
    if (flowEntries.length) {
      parts.push(`Form data: ${flowEntries.join(' | ')}`)
    }
  }
  return parts.join(' • ')
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SupportPayload
    const visitorId = payload.visitorId?.trim()
    const text = payload.text?.trim()
    if (!visitorId || !text) {
      return NextResponse.json({ success: false, error: 'visitorId and text are required' }, { status: 400 })
    }

    const conversation = ensureConversation(visitorId)
    
    // Insert the user message first (without response yet)
    await insertChatMessage(visitorId, text, '')

    const recent = await getRecentMessages(visitorId, 12)
    const history: OllamaMessage[] = []
    if (DEFAULT_SYSTEM_PROMPT) {
      const context = buildContextString(payload)
      history.push({
        role: 'system',
        content: context ? `${DEFAULT_SYSTEM_PROMPT}\nContext: ${context}` : DEFAULT_SYSTEM_PROMPT,
      })
    }
    recent.forEach(item => {
      if (!item.message) return
      // For user messages, use the message field
      history.push({ role: 'user', content: item.message })
      // For agent responses, use the response field
      if (item.response) {
        history.push({ role: 'assistant', content: item.response })
      }
    })

    const url = new URL(request.url)
    const streamMode =
      request.headers.get('accept')?.includes('text/event-stream') ||
      url.searchParams.get('stream') === 'true'

    if (streamMode) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (payload: Record<string, string>) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
          }
          try {
            const finalText = await streamChatWithOllama(history, chunk => {
              sendEvent({ type: 'chunk', text: chunk })
            })
            const cleaned = finalText.trim()
            if (cleaned) {
              await insertChatMessage(visitorId, text, cleaned)
            }
            sendEvent({ type: 'done', text: cleaned })
          } catch (err) {
            console.error('[Support][Ollama][stream]', err)
            sendEvent({
              type: 'error',
              message: err instanceof Error ? err.message : 'Support streaming failed.',
            })
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    }

    const llmResponse = await chatWithOllama(history)
    const agentText = llmResponse.text.trim()
    await insertChatMessage(visitorId, text, agentText)

    return NextResponse.json({ success: true, text: agentText })
  } catch (error) {
    console.error('[Support][Ollama]', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to reach support. Please try again in a moment.',
      },
      { status: 500 }
    )
  }
}
