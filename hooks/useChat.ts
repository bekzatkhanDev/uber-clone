// Chat hooks for real-time messaging between driver and customer
import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export interface ChatMessage {
  id: string;
  text: string;
  sender: {
    id: string;
    phone: string;
    first_name: string;
  };
  is_read: boolean;
  timestamp: string;
}

export interface ChatRoomStatus {
  id: string;
  trip: string;
  created_at: string;
  is_active: boolean;
}

export interface WebSocketMessage {
  type: 'chat_message' | 'typing_start' | 'typing_stop';
  message?: string;
  sender_id?: string;
  sender_phone?: string;
  sender_type?: 'driver' | 'customer';
  timestamp?: string;
}

// Get chat room status - checks if driver is assigned
export const useChatRoomStatus = (tripUuid: string) => {
  const [roomStatus, setRoomStatus] = useState<ChatRoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripUuid) {
      setIsLoading(false);
      return;
    }

    const fetchRoomStatus = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`/trips/${tripUuid}/chat-room/`);
        setRoomStatus(data);
        setError(null);
      } catch (err: any) {
        if (err.status === 404) {
          setRoomStatus(null);
          setError('No driver assigned yet');
        } else {
          setError(err.message || 'Failed to load chat room');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomStatus();
  }, [tripUuid]);

  return { roomStatus, isLoading, error, hasDriver: !!roomStatus };
};

// Get message history
export const useChatHistory = (tripUuid: string, enabled: boolean = true) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripUuid || !enabled) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`/trips/${tripUuid}/messages/`);
        setMessages(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [tripUuid, enabled]);

  return { messages, isLoading, error, setMessages };
};

// WebSocket connection for real-time chat
export const useChatWebSocket = (
  tripUuid: string,
  onMessageReceived: (message: WebSocketMessage) => void,
  enabled: boolean = true
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 1000;

  const connect = useCallback(() => {
    if (!tripUuid || !enabled) {
      return;
    }

    const getToken = async () => {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        // Get token from storage
        const token = await (async () => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('access-token');
          }
          return null;
        })();

        if (!token) {
          setConnectionError('Authentication required');
          setIsConnected(false);
          return;
        }

        const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/chat/${tripUuid}/?token=${token}`;
        
        try {
          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log('[WebSocket] Connected');
            setIsConnected(true);
            setConnectionError(null);
            reconnectCountRef.current = 0;
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              onMessageReceived(data);
            } catch (err) {
              console.error('[WebSocket] Failed to parse message:', err);
            }
          };

          ws.onerror = () => {
            console.error('[WebSocket] Error occurred');
            setConnectionError('Connection error');
          };

          ws.onclose = (event) => {
            console.log('[WebSocket] Closed', event.code, event.reason);
            setIsConnected(false);

            // Attempt reconnection with exponential backoff
            if (enabled && reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
              const delay = Math.min(
                BASE_RECONNECT_DELAY * Math.pow(2, reconnectCountRef.current),
                30000
              );
              reconnectCountRef.current += 1;
              console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            }
          };

          wsRef.current = ws;
        } catch (err) {
          console.error('[WebSocket] Failed to create connection:', err);
          setConnectionError('Failed to connect');
        }
      } catch (err: any) {
        setConnectionError(err.message || 'Connection failed');
        setIsConnected(false);
      }
    };

    getToken();
  }, [tripUuid, enabled, onMessageReceived]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message,
        type: 'chat_message',
      }));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    connectionError,
    sendMessage,
    disconnect,
    isConnecting: !isConnected && !connectionError && enabled,
  };
};

// Send message via REST API (fallback)
export const useSendChatMessage = (tripUuid: string) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    try {
      setIsPending(true);
      await fetchWithAuth(`/trips/${tripUuid}/messages/send/`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return false;
    } finally {
      setIsPending(false);
    }
  }, [tripUuid]);

  return { sendMessage, isPending, error };
};
