// Chat hooks: WebSocket (primary) + REST polling (reliable fallback)
import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import * as storage from '@/lib/storage';

// ─── Types (matched exactly to backend serializer) ───────────────────────────

export interface ChatMessage {
  id: number;
  text: string;
  sender: {
    id: number;
    phone: string;
    first_name: string;
    last_name: string;
  };
  is_read: boolean;
  created_at: string; // backend field name — was wrong "timestamp" before
}

// Shape the WebSocket consumer broadcasts (from chat_message event handler)
interface WsIncomingMessage {
  type: 'message' | 'connection_established' | 'error';
  message?: string;
  sender_id?: number;
  sender_phone?: string;
  created_at?: string;
  message_id?: number;
}

// ─── useChatRoomStatus ────────────────────────────────────────────────────────
// Checks whether a driver has been assigned (chat room only exists then).
// Backend returns 400 (not 404) with { detail: "..." } when no driver yet.

export const useChatRoomStatus = (tripUuid: string | undefined) => {
  const [hasDriver, setHasDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripUuid) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        setIsLoading(true);
        await fetchWithAuth(`/trips/${tripUuid}/chat-room/`);
        if (!cancelled) {
          setHasDriver(true);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          // 400 = no driver yet (expected), 404 = trip not found
          setHasDriver(false);
          if (err?.status !== 400 && err?.status !== 404) {
            setError(err?.message || 'Failed to load chat room');
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [tripUuid]);

  return { hasDriver, isLoading, error };
};

// ─── useChatMessages ──────────────────────────────────────────────────────────
// Loads and polls message history. Merges incoming WS messages to avoid
// duplicates. Poll interval applies only when WS is NOT connected.

export const useChatMessages = (
  tripUuid: string | undefined,
  enabled: boolean,
  wsConnected: boolean,
  pollIntervalMs = 3000,
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());

  const fetchMessages = useCallback(async (initial = false) => {
    if (!tripUuid || !enabled) return;
    try {
      if (initial) setIsLoading(true);
      const data: ChatMessage[] = await fetchWithAuth(`/trips/${tripUuid}/messages/`);
      const list = Array.isArray(data) ? data : [];
      setMessages(list);
      seenIdsRef.current = new Set(list.map((m) => m.id));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages');
    } finally {
      if (initial) setIsLoading(false);
    }
  }, [tripUuid, enabled]);

  // Initial load
  useEffect(() => {
    if (enabled) fetchMessages(true);
  }, [enabled, fetchMessages]);

  // Poll only while WS is not connected
  useEffect(() => {
    if (!enabled || wsConnected) return;
    const id = setInterval(() => fetchMessages(false), pollIntervalMs);
    return () => clearInterval(id);
  }, [enabled, wsConnected, pollIntervalMs, fetchMessages]);

  // Merge a single message received via WebSocket
  const addWsMessage = useCallback((msg: ChatMessage) => {
    if (seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, isLoading, error, addWsMessage };
};

// ─── useChatWebSocket ─────────────────────────────────────────────────────────
// Best-effort WebSocket connection. Falls back gracefully if auth fails.
// Uses @/lib/storage for token so it works on both native and web.

export const useChatWebSocket = (
  tripUuid: string | undefined,
  onMessage: (msg: ChatMessage) => void,
  enabled: boolean,
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const MAX_RETRIES = 5;
  // Store callback in a ref so changing it never triggers reconnect
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const connect = useCallback(() => {
    if (!tripUuid || !enabled) return;

    setIsConnecting(true);

    storage.getItem('access-token').then((token) => {
      if (!token) {
        setIsConnecting(false);
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const wsBase = baseUrl.replace(/^http/, 'ws');
      const wsUrl = `${wsBase}/ws/chat/${tripUuid}/?token=${token}`;

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setIsConnecting(false);
          reconnectCountRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data: WsIncomingMessage = JSON.parse(event.data);
            // Backend chat_message event handler sends type: "message"
            if (data.type === 'message' && data.message_id && data.message) {
              const msg: ChatMessage = {
                id: data.message_id,
                text: data.message,
                sender: {
                  id: data.sender_id ?? 0,
                  phone: data.sender_phone ?? '',
                  first_name: '',
                  last_name: '',
                },
                is_read: false,
                created_at: data.created_at ?? new Date().toISOString(),
              };
              onMessageRef.current(msg);
            }
          } catch {}
        };

        ws.onerror = () => {
          setIsConnected(false);
          setIsConnecting(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          setIsConnecting(false);
          wsRef.current = null;

          if (enabled && reconnectCountRef.current < MAX_RETRIES) {
            const delay = Math.min(1000 * 2 ** reconnectCountRef.current, 30000);
            reconnectCountRef.current += 1;
            reconnectTimerRef.current = setTimeout(connect, delay);
          }
        };

        wsRef.current = ws;
      } catch {
        setIsConnecting(false);
      }
    });
  }, [tripUuid, enabled]); // onMessage intentionally excluded — stored in ref

  useEffect(() => {
    if (enabled) connect();
    return disconnect;
  }, [enabled, connect, disconnect]);

  const sendMessage = useCallback((text: string): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat_message', message: text }));
      return true;
    }
    return false;
  }, []);

  return { isConnected, isConnecting, sendMessage, disconnect };
};

// ─── useSendMessage ───────────────────────────────────────────────────────────
// REST fallback for sending. Always available even when WS is down.

export const useSendMessage = (tripUuid: string | undefined) => {
  const [isPending, setIsPending] = useState(false);

  const send = useCallback(async (text: string): Promise<ChatMessage | null> => {
    if (!tripUuid) return null;
    try {
      setIsPending(true);
      const data: ChatMessage = await fetchWithAuth(`/trips/${tripUuid}/messages/send/`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return data;
    } catch {
      return null;
    } finally {
      setIsPending(false);
    }
  }, [tripUuid]);

  return { send, isPending };
};
