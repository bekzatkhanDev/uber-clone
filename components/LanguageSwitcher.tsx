import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from '@/i18n/I18nProvider';
import { Language, languageNames } from '@/i18n/index';

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'kk', flag: '🇰🇿' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'en', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-white/20 border border-white/30"
        style={{ marginRight: 12 }}
      >
        <Text style={{ fontSize: 16 }}>{current?.flag}</Text>
        <Text className="text-white text-xs font-JakartaSemiBold uppercase">
          {language}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-white rounded-2xl overflow-hidden w-64"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-center text-base font-JakartaBold py-4 border-b border-gray-100">
              🌐 Language / Тіл / Язык
            </Text>

            {LANGUAGES.map(({ code, flag }) => (
              <TouchableOpacity
                key={code}
                onPress={() => {
                  setLanguage(code);
                  setOpen(false);
                }}
                className={`flex-row items-center gap-3 px-5 py-4 border-b border-gray-50 ${
                  language === code ? 'bg-blue-50' : ''
                }`}
              >
                <Text style={{ fontSize: 24 }}>{flag}</Text>
                <Text
                  className={`flex-1 text-base font-Jakarta ${
                    language === code
                      ? 'text-blue-600 font-JakartaBold'
                      : 'text-gray-800'
                  }`}
                >
                  {languageNames[code]}
                </Text>
                {language === code && (
                  <Text className="text-blue-500 text-lg">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
