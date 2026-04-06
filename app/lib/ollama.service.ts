export type OllamaMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaResponse {
  text: string
  raw?: any
}

const OLLAMA_BASE = (process.env.OLLAMA_API || '').replace(/\/$/, '')
const OLLAMA_CHAT_ENDPOINT = (process.env.OLLAMA_CHAT_ENDPOINT || '').replace(/\/$/, '')
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gpt-4o-mini'
const DEFAULT_TEMPERATURE = Number(process.env.OLLAMA_TEMPERATURE ?? 0.25)
const DEFAULT_MAX_TOKENS = Number(process.env.OLLAMA_MAX_TOKENS ?? 512)

const FALLBACK_PATHS = [
  '/api/chat',
  '/api/chat/completions',
  '/api/v1/chat',
  '/api/v1/chat/completions',
  '/api/completions',
  '/api/v1/completions',
]

const SSE_PREFIX = 'data:'
const SSE_DONE = '[DONE]'

function serializeMessages(messages: OllamaMessage[]) {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
  }))
}

function extractTextFromMessage(raw: any): string {
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) {
    return raw.map(item => extractTextFromMessage(item)).filter(Boolean).join(' ')
  }
  if (typeof raw === 'object') {
    const text = extractTextFromMessage(raw.text ?? raw.content ?? raw.message ?? raw.data)
    if (text) return text
    if (typeof raw.content === 'string') return raw.content
    if (Array.isArray(raw.content)) return extractTextFromMessage(raw.content)
  }
  return ''
}

function buildEndpoints(): string[] {
  if (OLLAMA_CHAT_ENDPOINT) {
    return [OLLAMA_CHAT_ENDPOINT]
  }
  if (!OLLAMA_BASE) return []
  const endpoints = new Set<string>()
  endpoints.add(OLLAMA_BASE)
  if (!OLLAMA_BASE.includes('/api')) {
    FALLBACK_PATHS.forEach(suffix => endpoints.add(`${OLLAMA_BASE}${suffix}`))
  }
  return Array.from(endpoints)
}

async function executeOllamaRequest(endpoint: string, payload: Record<string, any>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const err = await response.text().catch(() => '')
    const error = new Error(`Ollama request failed (${response.status}): ${err}`)
    ;(error as any).status = response.status
    throw error
  }
  return response
}

async function tryOllamaEndpoints<T>(handler: (endpoint: string) => Promise<T>): Promise<T> {
  const endpoints = buildEndpoints()
  if (!endpoints.length) {
    throw new Error('OLLAMA_API is not configured. Set the OLLAMA_API env var.')
  }
  let lastError: Error | null = null
  for (const endpoint of endpoints) {
    try {
      return await handler(endpoint)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      if ((err as any).status === 404) {
        lastError = err
        continue
      }
      throw err
    }
  }
  throw lastError || new Error('Ollama request failed: no endpoints available.')
}

export async function chatWithOllama(messages: OllamaMessage[]): Promise<OllamaResponse> {
  const payload = {
    model: DEFAULT_MODEL,
    messages: serializeMessages(messages),
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: DEFAULT_MAX_TOKENS,
    stream: false,
  }

  return tryOllamaEndpoints(async endpoint => {
    const response = await executeOllamaRequest(endpoint, payload)
    const data = await response.json().catch(() => ({} as any))
    const choice = Array.isArray(data?.choices) ? data.choices[0] : data?.choice
    const message = choice?.message ?? choice?.content ?? data?.output ?? data
    const text = extractTextFromMessage(message)
    return {
      text: text || 'I am thinking right now… please hang tight.',
      raw: data,
    }
  })
}

function extractChunkFromEvent(event: any): string {
  if (!event) return ''
  const choice = Array.isArray(event?.choices) ? event.choices[0] : event?.choice
  const delta = choice?.delta
  const candidate =
    delta?.content ??
    choice?.message ??
    choice?.content ??
    event?.message ??
    event?.output ??
    event
  return extractTextFromMessage(candidate)
}

export async function streamChatWithOllama(messages: OllamaMessage[], onChunk: (chunk: string) => void): Promise<string> {
  const payload = {
    model: DEFAULT_MODEL,
    messages: serializeMessages(messages),
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: DEFAULT_MAX_TOKENS,
    stream: true,
  }

  return tryOllamaEndpoints(async endpoint => {
    const response = await executeOllamaRequest(endpoint, payload)
    const contentType = (response.headers.get('content-type') || '').toLowerCase()
    const reader = response.body?.getReader?.()
    const decoder = new TextDecoder()
    if (!reader) {
      const data = await response.json().catch(() => ({} as any))
      const text = extractTextFromMessage(data)
      if (text) {
        onChunk(text)
      }
      return text
    }

    if (!contentType.includes('text/event-stream') && !contentType.includes('stream')) {
      const data = await response.json().catch(() => ({} as any))
      const text = extractTextFromMessage(data)
      if (text) {
        onChunk(text)
      }
      return text
    }

    let buffer = ''
    let done = false
    let finalText = ''

    while (!done) {
      const { value, done: streamDone } = await reader.read()
      if (streamDone) break
      buffer += decoder.decode(value, { stream: true })
      let newlineIndex = buffer.indexOf('\n')
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        newlineIndex = buffer.indexOf('\n')
        if (!line) continue
        if (!line.startsWith(SSE_PREFIX)) continue
        const payloadText = line.slice(SSE_PREFIX.length).trim()
        if (!payloadText) continue
        if (payloadText === SSE_DONE) {
          done = true
          break
        }
        let parsed
        try {
          parsed = JSON.parse(payloadText)
        } catch (e) {
          continue
        }
        const chunk = extractChunkFromEvent(parsed)
        if (chunk) {
          finalText += chunk
          onChunk(chunk)
        }
        const finishReason = parsed?.choices?.[0]?.finish_reason ?? parsed?.choice?.finish_reason
        if (finishReason) {
          done = true
          break
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim())
        const chunk = extractChunkFromEvent(parsed)
        if (chunk) {
          finalText += chunk
          onChunk(chunk)
        }
      } catch (e) {
        // ignore leftover
      }
    }

    return finalText
  })
}
