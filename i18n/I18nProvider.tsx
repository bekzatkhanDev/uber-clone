import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useI18n, initializeLanguage, getTranslations, Language, Translations } from './index';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { language, setLanguage, t } = useI18n();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const savedLanguage = await initializeLanguage();
      await setLanguage(savedLanguage);
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

// Export currency helper
export const useCurrency = () => {
  const { t } = useTranslation();
  return {
    symbol: t.currency.symbol,
    code: t.currency.code,
    format: (amount: number) => {
      return `${t.currency.symbol}${amount.toFixed(2)}`;
    }
  };
};
