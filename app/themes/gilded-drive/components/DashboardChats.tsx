"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader, MessageCircle, ChevronLeft, Volume2, VolumeX, User, Trash2 } from 'lucide-react';
import '../styles/dashboard-chats.css';

interface ChatMessage {
  id: string;
  from: 'agent' | 'visitor';
  text: string;
  timestamp: number;
  delivered?: boolean;
  read?: boolean;
}

interface QueuedMessage {
  type: string;
  visitorId?: string;
  from?: string;
  typing?: boolean;
  [key: string]: any;
}

interface WebSocketMessage {
  type: string;
  conversations?: Conversation[];
  clientMessageId?: string;
  visitorId?: string;
  messageId?: string;
  delivered?: boolean;
  read?: boolean;
  messages?: WebSocketConversationMessage[];
  from?: string;
  typing?: boolean;
  text?: string;
  timestamp?: number;
  [key: string]: any;
}

interface WebSocketConversationMessage {
  client_message_id?: string;
  id: string | number;
  from_user: string;
  text: string;
  created_at: string;
  delivered: number;
  read_status: number;
}

interface ApiMessage {
  id: string | number;
  from_user: string;
  client_message_id?: string;
  text: string;
  created_at: string;
  delivered: boolean;
  read: boolean;
}

interface Conversation {
  id: string;
  visitorId: string;
  messageCount: number;
  lastMessage: ChatMessage | null;
  lastActive: number;
  createdAt: number;
  typing?: boolean;
}

export default function DashboardChats() {
  const wsRef = useRef<WebSocket | null>(null);
  const supportWsUrl = process.env.NEXT_PUBLIC_SUPPORT_WS_URL || 'ws://localhost:4001';
  const audioCtxRef = useRef<AudioContext | null>(null);
  const messagesMapRef = useRef<Record<string, ChatMessage[]>>({});
  const selectedConversationIdRef = useRef<string | null>(null);

  // UI state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('dashboardChatMuted') === '1';
    } catch (e) {
      return false;
    }
  });
  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingSentRef = useRef<boolean>(false);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Connect to WebSocket server as agent
  useEffect(() => {
    let reconnectTimer: any = null;
    let cancelled = false;

    function connect() {
      try {
        const ws = new WebSocket(supportWsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[DashboardChats] WS opened');
          try {
            // identify with agentId
            try {
              let aid = localStorage.getItem('support_agent_id');
              if (!aid) {
                aid = 'agent_' + Date.now() + '_' + Math.random().toString(36).slice(2,9);
                localStorage.setItem('support_agent_id', aid);
              }
              setAgentId(aid);
              ws.send(JSON.stringify({ type: 'identify', role: 'agent', agentId: aid }));
            } catch (e) {}
          } catch (e) {}
          sendQueuedMessages();
        };

        ws.onmessage = (ev) => {
          try {
            const msg: WebSocketMessage = typeof ev.data === 'string' ? JSON.parse(ev.data) : JSON.parse(ev.data.toString());

            // Conversation list update
            if (msg && msg.type === 'conversation_list') {
              if (Array.isArray(msg.conversations)) {
                const sortedConversations = msg.conversations.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
                setConversations(sortedConversations);
                
                // If we have a selected conversation, make sure it still exists after the update
                // If it was a temp ID that got replaced, find the real conversation by visitorId
                if (selectedConversationIdRef.current) {
                  const currentSelected = sortedConversations.find(c => c.id === selectedConversationIdRef.current);
                  if (!currentSelected) {
                    // Try to find by visitorId if we have the current conversation
                    const currentConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                    if (currentConv) {
                      const realConv = sortedConversations.find(c => c.visitorId === currentConv.visitorId);
                      if (realConv) {
                        setSelectedConversationId(realConv.id);
                        selectedConversationIdRef.current = realConv.id;
                        // Reload messages for the real conversation
                        fetchMessages(realConv.visitorId);
                      }
                    }
                  }
                }
              }
            }

              // Delivery acknowledgement from server
              if (msg && msg.type === 'delivery') {
                try {
                  const clientId = msg.clientMessageId;
                  const vid = msg.visitorId;
                  if (clientId && vid) {
                    const arr = messagesMapRef.current[vid] || [];
                    const idx = arr.findIndex((x) => x.id === clientId);
                    if (idx >= 0) {
                      arr[idx] = { ...arr[idx], delivered: !!msg.delivered };
                      messagesMapRef.current[vid] = arr;
                      const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                      if (selectedConv && selectedConv.visitorId === vid) setMessages([...arr]);
                    }
                  }
                } catch (e) {}
              }

              // Read receipt from server
              if (msg && msg.type === 'read_receipt') {
                try {
                  const messageId = msg.messageId;
                  const vid = msg.visitorId;
                  if (messageId && vid) {
                    const arr = messagesMapRef.current[vid] || [];
                    const idx = arr.findIndex((x) => x.id === messageId);
                    if (idx >= 0) {
                      arr[idx] = { ...arr[idx], read: true };
                      messagesMapRef.current[vid] = arr;
                      const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                      if (selectedConv && selectedConv.visitorId === vid) setMessages([...arr]);
                    }
                  }
                } catch (e) {}
              }

                // Full conversation fetch
                if (msg && msg.type === 'conversation') {
                  const visitorId = msg.visitorId;
                  if (visitorId && Array.isArray(msg.messages)) {
                    const history = msg.messages.map((m: WebSocketConversationMessage) => ({
                      id: m.client_message_id || m.id.toString(),
                      from: (m.from_user === 'agent' ? 'agent' : 'visitor') as 'agent' | 'visitor',
                      text: m.text,
                      timestamp: new Date(m.created_at).getTime(),
                      delivered: m.delivered === 1,
                      read: m.read_status === 1
                    })).sort((a, b) => a.timestamp - b.timestamp);
                    messagesMapRef.current[visitorId] = history;
                    const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                    if (selectedConv && selectedConv.visitorId === visitorId) {
                      setMessages(history);
                    }
                  }
                }

                // Typing indicator from visitor
                if (msg && msg.type === 'typing' && msg.from === 'visitor') {
                  try {
                    const vid = msg.visitorId;
                    setConversations(prev => prev.map(conv =>
                      conv.visitorId === vid
                        ? { ...conv, typing: !!msg.typing }
                        : conv
                    ));
                  } catch (e) {}
                }

            // Incoming message from a visitor
            if (msg && msg.type === 'chat_message' && msg.from === 'visitor') {
              const visitorId = msg.visitorId;
              if (!visitorId) return; // Guard against undefined visitorId
              console.log('[DashboardChats] Received visitor message for', visitorId, ':', msg.text);
              // Ensure conversation exists (create if new)
              setConversations((prev) => {
                const found = prev.find((c) => c.visitorId === visitorId);
                const lastMsg = { id: msg.messageId || Date.now().toString(), from: 'visitor' as const, text: msg.text || '', timestamp: Date.now(), delivered: false, read: false };
                if (found) {
                  const updated = prev.map((conv) =>
                    conv.visitorId === visitorId
                      ? { ...conv, messageCount: conv.messageCount + 1, lastMessage: lastMsg, lastActive: Date.now() }
                      : conv
                  );
                  return updated.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
                }
                // create new conversation entry
                const created: Conversation = {
                  id: `temp_${visitorId}_${Date.now()}`, // temporary id until conversation_list updates
                  visitorId,
                  messageCount: 1,
                  lastMessage: lastMsg,
                  lastActive: Date.now(),
                  createdAt: Date.now(),
                };
                return [created, ...prev].sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
              });

              // Add to messages map
              const newMessage: ChatMessage = {
                id: msg.messageId || `${Date.now()}_${Math.random()}`,
                from: 'visitor',
                text: msg.text || '',
                timestamp: msg.timestamp || Date.now(),
                delivered: msg.delivered,
                read: msg.read,
              };
              if (visitorId && typeof visitorId === 'string') {
                if (!messagesMapRef.current[visitorId as string]) messagesMapRef.current[visitorId as string] = [];
                if (!messagesMapRef.current[visitorId as string].some(m => m.id === newMessage.id)) {
                  messagesMapRef.current[visitorId as string].push(newMessage);
                  const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                  if (selectedConv && selectedConv.visitorId === visitorId) {
                    // Update messages state immediately for real-time display
                    setMessages(prev => [...prev, newMessage]);
                  }
                }
              }

              // Play notification sound for incoming visitor message
              try { playSound('incoming'); } catch (e) {}
            }

            // Incoming message from an agent (for multi-agent support)
            if (msg && msg.type === 'chat_message' && msg.from === 'agent') {
              const visitorId = msg.visitorId;
              if (!visitorId) return;
              const newMessage: ChatMessage = {
                id: msg.clientMessageId || msg.messageId || `${Date.now()}_${Math.random()}`,
                from: 'agent',
                text: msg.text || '',
                timestamp: msg.timestamp || Date.now(),
                delivered: msg.delivered,
                read: msg.read,
              };
              if (!messagesMapRef.current[visitorId]) messagesMapRef.current[visitorId] = [];
              if (!messagesMapRef.current[visitorId].some(m => m.id === newMessage.id)) {
                messagesMapRef.current[visitorId].push(newMessage);
                const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
                if (selectedConv && selectedConv.visitorId === visitorId) {
                  // Update messages state immediately for real-time display
                  setMessages(prev => [...prev, newMessage]);
                }
              }
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          console.log('[DashboardChats] WS closed');
          wsRef.current = null;
          if (!cancelled) reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          try { ws.close(); } catch (e) {}
        };
      } catch (e) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      cancelled = true;
      try { if (reconnectTimer) clearTimeout(reconnectTimer); } catch (e) {}
      try { if (wsRef.current) { wsRef.current.close(); wsRef.current = null; } } catch (e) {}
    };
  }, [supportWsUrl]);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch messages for a conversation from API
  const fetchMessages = async (visitorId: string) => {
    try {
      const res = await fetch(`/api/conversations/${visitorId}/messages`);
      if (res.ok) {
        const data = await res.json();
        const messages = data.messages || [];
        messagesMapRef.current[visitorId] = messages.map((m: ApiMessage) => ({
          id: m.id.toString(),
          from: (m.from_user === 'agent' ? 'agent' : 'visitor') as 'agent' | 'visitor',
          text: m.text,
          timestamp: new Date(m.created_at).getTime(),
          delivered: m.delivered,
          read: m.read
        }));
        const selectedConv = conversations.find(c => c.id === selectedConversationIdRef.current);
        if (selectedConv && selectedConv.visitorId === visitorId) {
          setMessages(messagesMapRef.current[visitorId]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messageWindowRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  // When a conversation is selected, fetch its full history
  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    setSelectedConversationId(conversationId);
    selectedConversationIdRef.current = conversationId;
    fetchMessages(conversation.visitorId);
  };

  // keep ref in sync with state so WS handlers can read latest selected id
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Send queued messages when WS opens
  function sendQueuedMessages() {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift();
        try {
          wsRef.current.send(JSON.stringify(msg));
          console.log('[DashboardChats] Sent queued message:', msg);
        } catch (e) {
          console.error('[DashboardChats] Failed to send queued message:', e);
        }
      }
    }
  }

  // Send typing indicator from agent (debounced)
  function sendAgentTyping(typing: boolean) {
    const conversation = conversations.find(c => c.id === selectedConversationIdRef.current);
    if (!conversation) return;
    
    const msg = { type: 'typing', visitorId: conversation.visitorId, from: 'agent', typing: !!typing };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && selectedConversationIdRef.current) {
      try {
        wsRef.current.send(JSON.stringify(msg));
        typingSentRef.current = !!typing;
      } catch (e) {}
    } else {
      messageQueueRef.current.push(msg);
      typingSentRef.current = !!typing;
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    // send typing true once and schedule false
    try {
      if (!typingSentRef.current) sendAgentTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        try { sendAgentTyping(false); typingSentRef.current = false; } catch (e) {}
      }, 1400);
    } catch (e) {}
  }

  const renderText = (text: string | null) => {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color: 'inherit'}}>{part}</a> : part
    );
  };

  // Delete a conversation
  const handleDeleteConversation = async () => {
    if (!selectedConversationId) return;
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConversationId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== selectedConversationId));
        setSelectedConversationId(null);
        selectedConversationIdRef.current = null;
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !selectedConversationId) return;

    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (!conversation) return;

    const visitorId = conversation.visitorId;
    console.log('[DashboardChats] Sending agent message to', visitorId, ':', text);
    const clientId = Date.now().toString();

    try {
      const res = await fetch(`/api/conversations/${visitorId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          from: 'agent',
          senderId: agentId || (typeof window !== 'undefined' ? localStorage.getItem('support_agent_id') : null),
          clientMessageId: clientId
        })
      });

      if (res.ok) {
        const newMsgData = await res.json();
        const newMsg: ChatMessage = {
          id: newMsgData.id,
          from: 'agent',
          text,
          timestamp: Date.now(),
          delivered: true,
        };
        if (!messagesMapRef.current[visitorId]) messagesMapRef.current[visitorId] = [];
        messagesMapRef.current[visitorId].push(newMsg);
        setMessages([...messagesMapRef.current[visitorId]]);

        // Send WebSocket message for real-time delivery to visitor
        const wsMessage = {
          type: 'chat_message',
          visitorId,
          from: 'agent',
          text,
          agentId: typeof window !== 'undefined' ? localStorage.getItem('support_agent_id') : null,
          clientMessageId: clientId,
          messageId: newMsgData.id
        };
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(wsMessage));
          console.log('[DashboardChats] Sent WebSocket message to server:', wsMessage);
        } else {
          messageQueueRef.current.push(wsMessage);
          console.log('[DashboardChats] Queued WebSocket message:', wsMessage);
        }

        // Update conversation list
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversationId
            ? { ...conv, messageCount: conv.messageCount + 1, lastMessage: newMsg, lastActive: Date.now() }
            : conv
        ).sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)));

        try { playSound('outgoing'); } catch (e) {}
        setInputValue('');
        // signal typing stopped
        try { if (typingSentRef.current) { sendAgentTyping(false); typingSentRef.current = false; } } catch (e) {}
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Sound notification
  function initAudioContext() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (e) {}
  }

  function playSound(type: 'incoming' | 'outgoing' | 'connected') {
    if (muted) return;
    try {
      initAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);

      // Different tones for incoming/outgoing/connected
      if (type === 'incoming') {
        o.frequency.value = 880;
        g.gain.exponentialRampToValueAtTime(0.14, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        o.start(now);
        o.stop(now + 0.22);
      } else if (type === 'outgoing') {
        o.frequency.value = 600;
        g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.start(now);
        o.stop(now + 0.16);
      } else {
        // connected
        o.frequency.value = 1320;
        g.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
        o.start(now);
        o.stop(now + 0.26);
      }
    } catch (e) {}
  }

  function toggleMute() {
    const n = !muted;
    setMuted(n);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('dashboardChatMuted', n ? '1' : '0');
    } catch (e) {}
  }

  return (
    <div className="dashboard-chats">
      <div className="chats-container">
        {/* Conversations list */}
        <div className="chats-sidebar">
          <div className="chats-sidebar-header">
            <MessageCircle size={18} />
            <h3>Active Conversations</h3>
          </div>
          <div className="chats-list">
            {conversations.length === 0 ? (
              <div className="chats-empty">No active conversations</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`chat-item ${selectedConversationId === conv.id ? 'active' : ''} ${conv.typing ? 'typing' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="chat-item-header">
                    <span className="chat-visitor-id">{conv.visitorId.slice(-8)}</span>
                    <span className="chat-count">{conv.messageCount}</span>
                    {conv.typing && <span className="typing-indicator">typing...</span>}
                  </div>
                  <div className="chat-item-preview">
                    {conv.lastMessage ? conv.lastMessage.text.slice(0, 60) : 'No messages yet'}
                  </div>
                  <div className="chat-item-time">
                    {new Date(conv.lastActive).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation detail */}
        <div className="chats-panel">
          {selectedConversationId ? (
            <>
              <div className="chats-panel-header">
                <button
                  className="chat-back"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="chat-header-info">
                  <h3>Conversation</h3>
                  <p className="chat-visitor-label">{conversations.find(c => c.id === selectedConversationId)?.visitorId}</p>
                </div>
                <button
                  className="chat-delete"
                  onClick={handleDeleteConversation}
                  title="Delete conversation"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="chats-panel-body">
                <div ref={messageWindowRef} className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="chat-messages-empty">No messages yet</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`chat-message ${m.from}`}>
                        <div className="avatar">
                          {m.from === 'agent' ? <User size={24} /> : <MessageCircle size={24} />}
                        </div>
                        <div className="message-bubble">
                          <div className="message-text">{renderText(m.text)}</div>
                          <div className="message-meta">
                            <div className="message-time">
                              {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            {m.from === 'agent' && (
                              <div className="message-status">
                                {m.read ? '✓✓' : m.delivered ? '✓' : '○'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form className="chats-panel-footer" onSubmit={handleSendMessage}>
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-input"
                  placeholder="Type your response..."
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!inputValue.trim() || loading}
                >
                  {loading ? <Loader size={18} /> : <Send size={18} />}
                </button>
              </form>
            </>
          ) : (
            <div className="chats-panel-empty">
              <MessageCircle size={48} strokeWidth={1.5} />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
