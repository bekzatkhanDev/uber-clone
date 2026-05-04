import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '@/i18n/I18nProvider';
import {
  useChatRoomStatus, useChatMessages, useChatWebSocket, useSendMessage, ChatMessage,
} from '@/hooks/useChat';
import { getCurrentUserId } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const ChatRoom = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const bg = isDark ? '#0f172a' : '#ffffff';
  const headerBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#f3f4f6';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#1e293b' : '#f3f4f6';
  const inputText = isDark ? '#f1f5f9' : '#111827';

  useEffect(() => {
    getCurrentUserId().then(setMyUserId);
  }, []);

  const { hasDriver, isLoading: checkingRoom, error: roomError } = useChatRoomStatus(tripId);

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
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setMessageText(text);
      }
    }
  };

  const isMyMessage = (msg: ChatMessage) =>
    myUserId !== null && String(msg.sender.id) === myUserId;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const Header = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: headerBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ color: '#0286FF', fontFamily: 'Jakarta-SemiBold', fontSize: 15 }}>‹ {t.common.back}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: textPrimary }}>{t.chat.tripChat}</Text>
          {isConnected !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 6, backgroundColor: isConnected ? '#22c55e' : isConnecting ? '#facc15' : '#9ca3af' }} />
              <Text style={{ fontSize: 11, color: textSecondary }}>
                {isConnected ? t.chat.live : isConnecting ? t.chat.connecting : t.chat.polling}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (checkingRoom || loadingHistory) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
        <Header />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: insets.bottom }}>
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text style={{ marginTop: 16, color: textSecondary }}>{t.chat.loadingChat}</Text>
        </View>
      </View>
    );
  }

  if (!hasDriver) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
        <Header />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: insets.bottom }}>
          <ActivityIndicator size="large" color="#0CC25F" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
            {t.chat.waitingForDriver}
          </Text>
          <Text style={{ textAlign: 'center', color: textSecondary }}>
            {t.chat.chatOpensWhenAccepted}
          </Text>
          {roomError && (
            <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{roomError}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header />

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
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
                  <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 4, marginLeft: 4, fontFamily: 'Jakarta' }}>
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
                  <Text style={{ fontSize: 15, color: mine ? '#ffffff' : textPrimary }}>
                    {msg.text}
                  </Text>
                  <Text style={{ fontSize: 11, marginTop: 4, color: mine ? 'rgba(255,255,255,0.7)' : textSecondary }}>
                    {formatTime(msg.created_at)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={{
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: borderColor,
        backgroundColor: headerBg,
        flexDirection: 'row', alignItems: 'flex-end', gap: 12,
        paddingBottom: insets.bottom + 12,
      }}>
        <TextInput
          style={{
            flex: 1, backgroundColor: inputBg, borderRadius: 20,
            paddingHorizontal: 16, paddingVertical: 12,
            fontSize: 15, color: inputText,
            maxHeight: 120,
          }}
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
            <Text style={{ color: messageText.trim() ? '#ffffff' : (isDark ? '#475569' : '#9ca3af'), fontSize: 20, fontFamily: 'Jakarta-Bold', marginLeft: 2 }}>›</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
