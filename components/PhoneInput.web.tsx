// Web PhoneInput — native Modal replaced with a positioned View dropdown (avoids portal issues)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  mask: string;
  name: string;
}

interface PhoneInputProps {
  label?: string;
  icon?: any;
  value?: string;
  onChangeText?: (phone: string) => void;
  onChangePhone?: (phone: string, isValid: boolean) => void;
  defaultCountry?: string;
  placeholder?: string;
  error?: string;
}

const COUNTRIES: Country[] = [
  { code: 'KZ', dialCode: '+7', flag: '🇰🇿', mask: '+7 (###) ###-##-##', name: 'Kazakhstan' },
  { code: 'RU', dialCode: '+7', flag: '🇷🇺', mask: '+7 (###) ###-##-##', name: 'Russia' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', mask: '+1 (###) ###-####', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', mask: '+44 #### ######', name: 'United Kingdom' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', mask: '+49 ### ########', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', mask: '+33 # ## ## ## ##', name: 'France' },
  { code: 'UA', dialCode: '+380', flag: '🇺🇦', mask: '+380 ## ### ####', name: 'Ukraine' },
];

const PhoneInputWeb: React.FC<PhoneInputProps> = ({
  label,
  icon,
  value = '',
  onChangeText,
  onChangePhone,
  defaultCountry = 'KZ',
  placeholder = 'Phone number',
  error = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [phone, setPhone] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatPhoneNumber = useCallback(
    (text: string, mask: string): string => {
      const cleaned = text.replace(/\D/g, '');
      const maskWithoutDial = mask.substring(selectedCountry.dialCode.length);
      let formatted = '';
      let di = 0;
      for (let i = 0; i < maskWithoutDial.length && di < cleaned.length; i++) {
        if (maskWithoutDial[i] === '#') { formatted += cleaned[di]; di++; }
        else formatted += maskWithoutDial[i];
      }
      return formatted;
    },
    [selectedCountry.dialCode]
  );

  useEffect(() => {
    if (value) {
      const country = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhone(formatPhoneNumber(value.substring(country.dialCode.length), country.mask));
      }
    }
  }, [value, formatPhoneNumber]);

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text, selectedCountry.mask);
    setPhone(formatted);
    const cleaned = formatted.replace(/\D/g, '');
    const full = selectedCountry.dialCode + cleaned;
    onChangeText?.(full);
    const expectedLen = selectedCountry.mask.split('#').length - 1;
    onChangePhone?.(full, cleaned.length === expectedLen);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPhone('');
    setShowPicker(false);
    onChangeText?.(country.dialCode);
    onChangePhone?.(country.dialCode, false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <View style={{ width: '100%', position: 'relative' }}>
      {label && (
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}
          className="font-JakartaSemiBold">{label}</Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 999,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? '#0286FF' : error ? '#ef4444' : '#e5e5e5',
          height: 56,
          paddingHorizontal: 16,
          overflow: 'hidden',
        }}
      >
        {icon && (
          <Image source={icon} style={{ width: 22, height: 22, marginRight: 10, opacity: 0.55 }} resizeMode="contain" />
        )}

        {/* Country selector */}
        <TouchableOpacity
          onPress={() => setShowPicker((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12, marginRight: 12, borderRightWidth: 1, borderRightColor: '#e0e0e0' }}
        >
          <Text style={{ fontSize: 22, marginRight: 4 }}>{selectedCountry.flag}</Text>
          <Text style={{ fontSize: 15, color: '#000', fontWeight: '500', marginRight: 2 }}>{selectedCountry.dialCode}</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>▼</Text>
        </TouchableOpacity>

        {/* Phone input */}
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            fontSize: 16,
            color: '#000',
            height: '100%',
            paddingVertical: 0,
            outlineStyle: 'none' as any,
          }}
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {error ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{error}</Text> : null}

      {/* Country picker dropdown — positioned View (no Modal on web) */}
      {showPicker && (
        <>
          {/* Click-away overlay */}
          <TouchableOpacity
            style={{ position: 'fixed' as any, inset: 0, zIndex: 998 }}
            onPress={() => setShowPicker(false)}
            activeOpacity={1}
          />
          <View
            style={{
              position: 'absolute',
              top: label ? 88 : 64,
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#f0f0f0',
              maxHeight: 280,
              zIndex: 999,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
              overflow: 'hidden',
            }}
          >
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCountrySelect(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}
                >
                  <Text style={{ fontSize: 26, marginRight: 12 }}>{item.flag}</Text>
                  <Text style={{ flex: 1, fontSize: 15, color: '#111' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#666' }}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default PhoneInputWeb;
