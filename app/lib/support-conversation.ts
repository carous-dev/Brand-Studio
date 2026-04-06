// Support conversation management functions

export interface ConversationMessage {
  id: string
  visitorId: string
  message: string
  response: string
  timestamp: Date
}

export interface Conversation {
  id: string
  visitorId: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for conversations (in production, use a database)
const conversations = new Map<string, Conversation>()

export function ensureConversation(visitorId: string): Conversation {
  let conversation = conversations.get(visitorId)
  
  if (!conversation) {
    conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitorId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.set(visitorId, conversation)
  }
  
  return conversation
}

export function getRecentMessages(visitorId: string, limit: number = 10): ConversationMessage[] {
  const conversation = conversations.get(visitorId)
  if (!conversation) return []
  
  return conversation.messages
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

export function insertChatMessage(
  visitorId: string,
  message: string,
  response: string
): ConversationMessage {
  const conversation = ensureConversation(visitorId)
  
  const chatMessage: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    visitorId,
    message,
    response,
    timestamp: new Date()
  }
  
  conversation.messages.push(chatMessage)
  conversation.updatedAt = new Date()
  
  return chatMessage
}

export function getConversation(visitorId: string): Conversation | null {
  return conversations.get(visitorId) || null
}

export function deleteConversation(visitorId: string): boolean {
  return conversations.delete(visitorId)
}

export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values())
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}