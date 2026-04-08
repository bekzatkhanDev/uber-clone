import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Типы
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
  style?: ViewStyle;
}

// Базовые данные стран
const COUNTRIES: Country[] = [
  { code: 'KZ', dialCode: '+7', flag: '🇰🇿', mask: '+7 (###) ###-##-##', name: 'Kazakhstan' },
  { code: 'RU', dialCode: '+7', flag: '🇷🇺', mask: '+7 (###) ###-##-##', name: 'Russia' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', mask: '+1 (###) ###-####', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', mask: '+44 #### ######', name: 'United Kingdom' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', mask: '+49 ### ########', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', mask: '+33 # ## ## ## ##', name: 'France' },
  { code: 'UA', dialCode: '+380', flag: '🇺🇦', mask: '+380 ## ### ####', name: 'Ukraine' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  icon,
  value = '',
  onChangeText,
  onChangePhone,
  defaultCountry = 'KZ',
  placeholder = 'Введите номер телефона',
  error = '',
  style,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [phone, setPhone] = useState<string>('');
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  const formatPhoneNumber = useCallback(
    (text: string, mask: string): string => {
      // Удаляем все нецифровые символы
      const cleaned = text.replace(/\D/g, '');

      // Применяем маску
      let formatted = '';
      let digitIndex = 0;

      const maskWithoutDialCode = mask.substring(selectedCountry.dialCode.length);

      for (let i = 0; i < maskWithoutDialCode.length && digitIndex < cleaned.length; i++) {
        if (maskWithoutDialCode[i] === '#') {
          formatted += cleaned[digitIndex];
          digitIndex++;
        } else {
          formatted += maskWithoutDialCode[i];
        }
      }

      return formatted;
    },
    [selectedCountry.dialCode]
  );

  useEffect(() => {
    if (value) {
      // Парсинг входящего значения
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        const numberPart = value.substring(country.dialCode.length);
        setPhone(formatPhoneNumber(numberPart, country.mask));
      }
    }
  }, [value, formatPhoneNumber]);

  const handlePhoneChange = (text: string): void => {
    const formatted = formatPhoneNumber(text, selectedCountry.mask);
    setPhone(formatted);
    
    // Возвращаем полный номер с кодом страны
    const cleaned = formatted.replace(/\D/g, '');
    const fullNumber = selectedCountry.dialCode + cleaned;
    
    // Call both callbacks if provided
    onChangeText?.(fullNumber);
    onChangePhone?.(fullNumber, isValid(cleaned));
  };

  const isValid = (cleanedNumber: string): boolean => {
    // Простая валидация по длине
    const expectedLength = selectedCountry.mask.split('#').length - 1;
    return cleanedNumber.length === expectedLength;
  };

  const handleCountrySelect = (country: Country): void => {
    setSelectedCountry(country);
    setPhone('');
    setShowCountryPicker(false);
    onChangeText?.(country.dialCode);
    onChangePhone?.(country.dialCode, false);
    // Фокус на input после выбора страны
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryDialCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {icon && (
          <Image source={icon} style={styles.icon} />
        )}
        
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={selectedCountry.mask.length - selectedCountry.dialCode.length}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите страну</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              renderItem={renderCountryItem}
              keyExtractor={(item: Country) => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  icon: any;
  inputContainer: ViewStyle;
  inputContainerFocused: ViewStyle;
  inputContainerError: ViewStyle;
  countrySelector: ViewStyle;
  flag: TextStyle;
  dialCode: TextStyle;
  arrow: TextStyle;
  input: TextStyle;
  errorText: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  closeButton: TextStyle;
  countryItem: ViewStyle;
  countryFlag: TextStyle;
  countryName: TextStyle;
  countryDialCode: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    marginRight: 12,
  },
  flag: {
    fontSize: 24,
    marginRight: 6,
  },
  dialCode: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginRight: 4,
  },
  arrow: {
    fontSize: 10,
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
    paddingVertical: 0,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  countryDialCode: {
    fontSize: 14,
    color: '#666',
  },
});

export default PhoneInput;