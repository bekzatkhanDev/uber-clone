import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme, Appearance, Platform } from 'react-native';
import { getItem, setItem } from '@/lib/storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  colorScheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const systemColorScheme = useRNColorScheme();

  // Determine actual color scheme based on theme setting
  const colorScheme: 'light' | 'dark' = 
    theme === 'system' ? systemColorScheme : theme;
  
  const isDark = colorScheme === 'dark';

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Apply theme to web (class on html) and native (Appearance API)
  useEffect(() => {
    if (!isLoaded) return;

    if (Platform.OS === 'web') {
      const rootElement = typeof document !== 'undefined' ? document.documentElement : null;
      if (rootElement) {
        rootElement.classList.remove('light', 'dark');
        rootElement.classList.add(colorScheme);
        rootElement.setAttribute('data-theme', colorScheme);
      }
    } else {
      // Tell React Native's Appearance API so NativeWind dark: classes update
      Appearance.setColorScheme(colorScheme);
    }
  }, [colorScheme, isLoaded]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, toggle based on current system scheme
      setTheme(systemColorScheme === 'dark' ? 'light' : 'dark');
    }
  };

  const value: ThemeContextType = {
    theme,
    colorScheme,
    setTheme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
