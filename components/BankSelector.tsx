import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

// ─── Bank definitions (single source of truth) 

export const BANKS = [
  {
    id: 'kaspi' as const,
    name: 'Kaspi Bank',
    shortName: 'Kaspi',
    tagline: 'kaspi.kz',
    bgColor: '#EF3124',
    textColor: '#ffffff',
    initials: 'K',
    url: 'https://kaspi.kz',
  },
  {
    id: 'halyk' as const,
    name: 'Halyk Bank',
    shortName: 'Halyk',
    tagline: 'halykbank.kz',
    bgColor: '#007A3D',
    textColor: '#ffffff',
    initials: 'H',
    url: 'https://halykbank.kz',
  },
  {
    id: 'freedom' as const,
    name: 'Freedom Bank',
    shortName: 'Freedom',
    tagline: 'ffin.kz',
    bgColor: '#1B4FBB',
    textColor: '#ffffff',
    initials: 'F',
    url: 'https://ffin.kz',
  },
] as const;

export type BankId = (typeof BANKS)[number]['id'];

export const getBankById = (id: BankId | null) =>
  id ? BANKS.find((b) => b.id === id) ?? null : null;

// ─── BankSelector ─────────────────────────────────────────────────────────────

interface BankSelectorProps {
  selectedBank: BankId | null;
  onSelect: (id: BankId) => void;
  /** Renders smaller cards — useful inside a profile list row */
  compact?: boolean;
}

const BankSelector = ({ selectedBank, onSelect, compact = false }: BankSelectorProps) => {
  return (
    <View>
      {BANKS.map((bank) => {
        const isSelected = selectedBank === bank.id;

        return (
          <TouchableOpacity
            key={bank.id}
            onPress={() => onSelect(bank.id)}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: compact ? 10 : 12,
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? bank.bgColor : '#e5e7eb',
              backgroundColor: isSelected ? `${bank.bgColor}0D` : '#ffffff',
              padding: compact ? 10 : 12,
              marginBottom: compact ? 8 : 10,
            }}
          >
            {/* Logo badge */}
            <View
              style={{
                width: compact ? 36 : 44,
                height: compact ? 36 : 44,
                borderRadius: compact ? 8 : 10,
                backgroundColor: bank.bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                shadowColor: bank.bgColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  color: bank.textColor,
                  fontSize: compact ? 16 : 20,
                  fontWeight: '900',
                  letterSpacing: -0.5,
                }}
              >
                {bank.initials}
              </Text>
            </View>

            {/* Name & official link */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: compact ? 14 : 15, fontWeight: '700', color: '#111827' }}>
                {bank.name}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  Linking.openURL(bank.url).catch(() => {});
                }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                  {bank.tagline}{' '}
                  <Text style={{ color: bank.bgColor, fontWeight: '600' }}>↗</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Radio */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: isSelected ? bank.bgColor : '#d1d5db',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: bank.bgColor,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BankSelector;
