import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={styles.trigger}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{current?.flag}</Text>
        <Text style={styles.code}>{language.toUpperCase()}</Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown — absolutely positioned, no Modal */}
      {open && (
        <>
          {/* Invisible backdrop to close on outside tap */}
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setOpen(false)}
            activeOpacity={1}
          />

          <View style={styles.dropdown}>
            {LANGUAGES.map(({ code, flag }) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleSelect(code)}
                style={[
                  styles.option,
                  language === code && styles.optionActive,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.optionFlag}>{flag}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    language === code && styles.optionLabelActive,
                  ]}
                >
                  {languageNames[code]}
                </Text>
                {language === code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 12,
    zIndex: 9999,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  flag: {
    fontSize: 16,
  },
  code: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrow: {
    color: '#fff',
    fontSize: 8,
    marginLeft: 2,
  },
  // Backdrop covers the full screen behind the dropdown
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9998,
    // On web, extend to cover the viewport
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 9999,
    minWidth: 160,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  optionActive: {
    backgroundColor: '#EFF6FF',
  },
  optionFlag: {
    fontSize: 20,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  checkmark: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
});
