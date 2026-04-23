import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useChatRoomStatus,
  useChatMessages,
  useChatWebSocket,
  useSendMessage,
  ChatMessage,
} from '@/hooks/useChat';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { getCurrentUserId } from '@/hooks/useAuth';
import { useTranslation } from '@/i18n/I18nProvider';

const DriverChat = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data: dashboard } = useDriverDashboard();
  const activeTrip = dashboard?.active_trip;
  const tripId: string | undefined = activeTrip?.id;

  const [messageText, setMessageText] = useState('');
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getCurrentUserId().then(setMyUserId);
  }, []);

  const { hasDriver, isLoading: checkingRoom } = useChatRoomStatus(tripId);

  const handleWsMessage = useCallback((msg: ChatMessage) => {
    addWsMessage(msg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { isConnected, isConnecting, sendMessage: wsSend } = useChatWebSocket(
    tripId,
    handleWsMessage,
    hasDriver,
  );

  const { messages, isLoading: loadingHistory, addWsMessage } = useChatMessages(
    tripId,
    hasDriver,
    isConnected,
  );

  const { send: restSend, isPending: isSending } = useSendMessage(tripId);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !hasDriver) return;
    setMessageText('');

    const sentViaWs = wsSend(text);
    if (!sentViaWs) {
      const saved = await restSend(text);
      if (saved) {
        addWsMessage(saved);
      } else {
        Alert.alert(t.common.error, t.chat.failedToSend);
        setMessageText(text);
      }
    }
  };

  const isMyMessage = (msg: ChatMessage) =>
    myUserId !== null && String(msg.sender.id) === myUserId;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── No active trip ──
  if (!tripId || !activeTrip) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Text className="text-5xl mb-4">💬</Text>
        <Text className="text-2xl font-JakartaBold text-gray-700 mb-2 text-center">
          {t.chat.noActiveTripTitle}
        </Text>
        <Text className="text-center text-gray-500">
          {t.chat.noActiveTripDesc}
        </Text>
      </View>
    );
  }

  // ── Loading ──
  if (checkingRoom || loadingHistory) {
    return (
      <View className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text className="mt-4 text-gray-500">{t.chat.loadingChat}</Text>
      </View>
    );
  }

  // ── Waiting ──
  if (!hasDriver) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Text className="text-xl font-JakartaBold text-gray-700 mb-2 text-center">
          {t.chat.chatUnavailableTitle}
        </Text>
        <Text className="text-center text-gray-500">
          {t.chat.chatUnavailableDesc}
        </Text>
      </View>
    );
  }

  // ── Chat UI ──
  const customer = activeTrip?.customer;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="px-5 py-3 border-b border-gray-100 bg-white">
        <Text className="text-xl font-JakartaBold">
          {customer?.first_name ? `${t.chat.chatWith} ${customer.first_name}` : t.chat.passengerChat}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <View className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-400' : 'bg-gray-400'
          }`} />
          <Text className="text-xs text-gray-400">
            {isConnected ? t.chat.live : isConnecting ? t.chat.connecting : t.chat.polling}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-center font-Jakarta">
              {t.chat.noMessagesYet}
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const mine = isMyMessage(msg);
            return (
              <View key={msg.id} className={`flex mb-3 ${mine ? 'items-end' : 'items-start'}`}>
                {!mine && (
                  <Text className="text-xs text-gray-400 mb-1 ml-1 font-Jakarta">
                    {msg.sender.first_name || msg.sender.phone}
                  </Text>
                )}
                <View className={`max-w-[78%] px-4 py-2 rounded-2xl ${
                  mine ? 'bg-[#0CC25F] rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
                }`}>
                  <Text className={`text-base ${mine ? 'text-white' : 'text-gray-800'}`}>
                    {msg.text}
                  </Text>
                  <Text className={`text-xs mt-1 ${mine ? 'text-green-100' : 'text-gray-400'}`}>
                    {formatTime(msg.created_at)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View className="px-4 py-3 border-t border-gray-100 bg-white flex-row items-end gap-3">
        <TextInput
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base"
          placeholder={t.chat.typeMessage}
          placeholderTextColor="#9ca3af"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!isSending}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${
            messageText.trim() && !isSending ? 'bg-[#0CC25F]' : 'bg-gray-200'
          }`}
          onPress={handleSend}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-lg font-JakartaBold" style={{ marginLeft: 2 }}>›</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DriverChat;
