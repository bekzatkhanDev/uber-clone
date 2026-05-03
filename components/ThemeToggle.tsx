import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
}

export default function ThemeToggle({ size = 'medium', variant = 'button' }: Props) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  const sizeStyles = {
    small: { width: 40, height: 40 },
    medium: { width: 50, height: 50 },
    large: { width: 60, height: 60 },
  };

  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.iconButton, sizeStyles[size]]}
        activeOpacity={0.7}
        accessibilityLabel="Toggle theme"
        accessibilityRole="button"
      >
        <View style={styles.iconContainer}>
          {isDark ? (
            // Sun icon for dark mode
            <View style={[styles.sun, { width: iconSize[size], height: iconSize[size] }]}>
              <View style={styles.sunCenter} />
              {[...Array(8)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.sunRay,
                    {
                      transform: [
                        { rotate: `${i * 45}deg` },
                        { translateY: -iconSize[size] * 0.7 },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          ) : (
            // Moon icon for light mode
            <View style={[styles.moon, { width: iconSize[size], height: iconSize[size] }]}>
              <View style={styles.moonShape} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
      activeOpacity={0.7}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
    >
      <View style={styles.toggleContainer}>
        <View style={[styles.toggleTrack, isDark ? styles.trackDark : styles.trackLight]}>
          <View
            style={[
              styles.toggleThumb,
              isDark ? styles.thumbDark : styles.thumbLight,
              { transform: [{ translateX: isDark ? 24 : 0 }] },
            ]}
          >
            {isDark ? (
              <View style={styles.sunMini}>
                <View style={styles.sunMiniCenter} />
              </View>
            ) : (
              <View style={styles.moonMini} />
            )}
          </View>
        </View>
        <View style={styles.labelContainer}>
          {/* Empty label container for potential text */}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sun icon
  sun: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunCenter: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    borderRadius: 9999,
    backgroundColor: '#FCD34D',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: '30%',
    backgroundColor: '#FCD34D',
    borderRadius: 1,
  },
  // Moon icon
  moon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonShape: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#1F2937',
  },
  // Toggle button styles
  button: {
    borderRadius: 9999,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLight: {
    backgroundColor: '#E5E7EB',
  },
  buttonDark: {
    backgroundColor: '#374151',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  trackLight: {
    backgroundColor: '#D1D5DB',
  },
  trackDark: {
    backgroundColor: '#1F2937',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbLight: {
    backgroundColor: '#FFFFFF',
  },
  thumbDark: {
    backgroundColor: '#FCD34D',
  },
  sunMini: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  sunMiniCenter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: '#F59E0B',
    top: 3,
    left: 3,
  },
  moonMini: {
    width: 14,
    height: 14,
    borderRadius: 9999,
    backgroundColor: '#6B7280',
  },
  labelContainer: {
    marginLeft: 8,
  },
});
