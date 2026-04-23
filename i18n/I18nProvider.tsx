import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useI18n, initializeLanguage, Language, Translations } from './index';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useI18n();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeLanguage().then((saved) => {
      setLanguage(saved).then(() => setIsReady(true));
    });
  }, []);

  // Stable reference — only recreates when language actually changes.
  // Prevents unnecessary re-renders in consumers while still propagating
  // real language changes.
  const value = useMemo<I18nContextType>(
    () => ({ language, setLanguage, t }),
    [language, t],  // setLanguage is a stable Zustand action — safe to omit
  );

  // On web, render children immediately with the default language
  // (Russian) instead of returning null, to avoid a blank-page flash.
  // The language will correct itself after initializeLanguage resolves.
  return (
    <I18nContext.Provider value={value}>
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

export const useCurrency = () => {
  const { t } = useTranslation();
  return {
    symbol: t.currency.symbol,
    code: t.currency.code,
    format: (amount: number) => `${t.currency.symbol}${amount.toFixed(2)}`,
  };
};
