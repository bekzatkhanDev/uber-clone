import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useChatRoomStatus, useChatMessages, useChatWebSocket, useSendMessage, ChatMessage,
} from '@/hooks/useChat';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { getCurrentUserId } from '@/hooks/useAuth';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const DriverChat = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const bg = isDark ? '#0f172a' : '#ffffff';
  const headerBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#f3f4f6';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#1e293b' : '#f3f4f6';
  const inputText = isDark ? '#f1f5f9' : '#111827';

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

  const { isConnected, isConnecting, sendMessage: wsSend } = useChatWebSocket(tripId, handleWsMessage, hasDriver);
  const { messages, isLoading: loadingHistory, addWsMessage } = useChatMessages(tripId, hasDriver, isConnected);
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

  if (!tripId || !activeTrip) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
        <Text style={{ fontSize: 22, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
          {t.chat.noActiveTripTitle}
        </Text>
        <Text style={{ textAlign: 'center', color: textSecondary }}>
          {t.chat.noActiveTripDesc}
        </Text>
      </View>
    );
  }

  if (checkingRoom || loadingHistory) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text style={{ marginTop: 16, color: textSecondary }}>{t.chat.loadingChat}</Text>
      </View>
    );
  }

  if (!hasDriver) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
          {t.chat.chatUnavailableTitle}
        </Text>
        <Text style={{ textAlign: 'center', color: textSecondary }}>
          {t.chat.chatUnavailableDesc}
        </Text>
      </View>
    );
  }

  const customer = activeTrip?.customer;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: headerBg }}>
        <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: textPrimary }}>
          {customer?.first_name ? `${t.chat.chatWith} ${customer.first_name}` : t.chat.passengerChat}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 6, backgroundColor: isConnected ? '#22c55e' : isConnecting ? '#facc15' : '#9ca3af' }} />
          <Text style={{ fontSize: 11, color: textSecondary }}>
            {isConnected ? t.chat.live : isConnecting ? t.chat.connecting : t.chat.polling}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ color: textSecondary, textAlign: 'center', fontFamily: 'Jakarta' }}>
              {t.chat.noMessagesYet}
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const mine = isMyMessage(msg);
            return (
              <View key={msg.id} style={{ flexDirection: 'column', marginBottom: 12, alignItems: mine ? 'flex-end' : 'flex-start' }}>
                {!mine && (
                  <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 4, marginLeft: 4 }}>
                    {msg.sender.first_name || msg.sender.phone}
                  </Text>
                )}
                <View style={{
                  maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomRightRadius: mine ? 4 : 18,
                  borderBottomLeftRadius: mine ? 18 : 4,
                  backgroundColor: mine ? '#0CC25F' : (isDark ? '#1e293b' : '#f3f4f6'),
                }}>
                  <Text style={{ fontSize: 15, color: mine ? '#ffffff' : textPrimary }}>{msg.text}</Text>
                  <Text style={{ fontSize: 11, marginTop: 4, color: mine ? 'rgba(255,255,255,0.7)' : textSecondary }}>
                    {formatTime(msg.created_at)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: borderColor, backgroundColor: headerBg, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <TextInput
          style={{ flex: 1, backgroundColor: inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: inputText, maxHeight: 120 }}
          placeholder={t.chat.typeMessage}
          placeholderTextColor={isDark ? '#475569' : '#9ca3af'}
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
          style={{
            width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
            backgroundColor: messageText.trim() && !isSending ? '#0CC25F' : (isDark ? '#1e293b' : '#e5e7eb'),
          }}
          onPress={handleSend}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={isDark ? '#94a3b8' : '#9ca3af'} />
          ) : (
            <Text style={{ color: messageText.trim() ? '#ffffff' : (isDark ? '#475569' : '#9ca3af'), fontSize: 20, marginLeft: 2 }}>›</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DriverChat;
