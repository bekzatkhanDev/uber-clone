// Chat screen for real-time messaging between driver and customer
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useChatRoomStatus,
  useChatHistory,
  useChatWebSocket,
  useSendChatMessage,
  ChatMessage,
  WebSocketMessage,
} from '@/hooks/useChat';
import { useActiveTrip } from '@/hooks/useTrips';

const Chat = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  
  // Get active trip if no tripId provided
  const { data: activeTrip } = useActiveTrip();
  const currentTripId = tripId || (activeTrip?.id as string);
  
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Check if chat room exists (driver assigned)
  const { hasDriver, isLoading: checkingRoom, error: roomError } = useChatRoomStatus(currentTripId);
  
  // Load message history
  const {
    messages: historyMessages,
    isLoading: loadingHistory,
    setMessages: setHistoryMessages,
  } = useChatHistory(currentTripId, hasDriver);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (wsMessage: WebSocketMessage) => {
    if (wsMessage.type === 'chat_message') {
      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        text: wsMessage.message || '',
        sender: {
          id: wsMessage.sender_id || '',
          phone: wsMessage.sender_phone || '',
          first_name: wsMessage.sender_type === 'driver' ? 'Driver' : 'Customer',
        },
        is_read: false,
        timestamp: wsMessage.timestamp || new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
    }
  };
  
  // WebSocket connection
  const {
    isConnected,
    connectionError,
    sendMessage: sendWsMessage,
    isConnecting,
  } = useChatWebSocket(currentTripId, handleWebSocketMessage, hasDriver);
  
  // REST API fallback for sending
  const { sendMessage: sendRestMessage, isPending } = useSendChatMessage(currentTripId);
  
  // Sync history messages
  useEffect(() => {
    if (historyMessages.length > 0) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);
  
  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !hasDriver) return;
    
    const text = messageText.trim();
    setMessageText('');
    
    // Try WebSocket first
    const wsSuccess = sendWsMessage(text);
    
    // Fallback to REST if WebSocket not available
    if (!wsSuccess) {
      const restSuccess = await sendRestMessage(text);
      if (restSuccess) {
        // Add optimistic update
        const newMessage: ChatMessage = {
          id: `${Date.now()}`,
          text,
          sender: {
            id: 'me',
            phone: '',
            first_name: 'Me',
          },
          is_read: true,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setMessageText(text);
      }
    }
  };
  
  // Render message bubble
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isMe = msg.sender.id === 'me' || msg.sender.phone === ''; // Simplified check
    const time = new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <View
        key={msg.id || index}
        className={`flex mb-2 ${isMe ? 'items-end' : 'items-start'}`}
      >
        <View
          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
            isMe
              ? 'bg-[#0CC25F] rounded-br-md'
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {msg.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-500'}`}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  };
  
  // Loading state
  if (checkingRoom || loadingHistory) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text className="mt-4 text-gray-500">Loading chat...</Text>
      </View>
    );
  }
  
  // No driver assigned
  if (!hasDriver) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center p-5"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-2xl font-JakartaBold text-gray-700 mb-2">
          No Driver Assigned Yet
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          Waiting for a driver to be assigned to your trip. Chat will be available
          once a driver accepts your ride.
        </Text>
        <TouchableOpacity
          className="bg-[#0CC25F] px-6 py-3 rounded-xl"
          onPress={() => router.push('/(root)/(tabs)/home')}
        >
          <Text className="text-white font-JakartaSemiBold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Connection error
  if (connectionError || roomError) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center p-5"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-xl font-JakartaBold text-red-500 mb-2">
          Connection Error
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          {connectionError || roomError}
        </Text>
        <TouchableOpacity
          className="bg-[#0CC25F] px-6 py-3 rounded-xl"
          onPress={() => router.replace('/(root)/(tabs)/chat')}
        >
          <Text className="text-white font-JakartaSemiBold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="px-5 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-JakartaBold">Trip Chat</Text>
        <View className="flex-row items-center mt-1">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <Text className="text-sm text-gray-500">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </Text>
        </View>
      </View>
      
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5 py-3"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-center">
              No messages yet{'\n'}Start the conversation!
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => renderMessage(msg, index))
        )}
      </ScrollView>
      
      {/* Input */}
      <View className="px-5 py-3 border-t border-gray-200 bg-white flex-row items-center gap-3">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base"
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          editable={!isPending}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${
            messageText.trim() && !isPending
              ? 'bg-[#0CC25F]'
              : 'bg-gray-300'
          }`}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isPending}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-xl font-JakartaBold">›</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Chat;
