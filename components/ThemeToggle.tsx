import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
}

export default function ThemeToggle({ size = 'medium', variant = 'button' }: Props) {
  const { toggleTheme, isDark } = useTheme();
  const translateX = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isDark]);

  if (variant === 'icon') {
    const iconPx = size === 'small' ? 36 : size === 'large' ? 52 : 44;
    return (
      <Pressable
        onPress={toggleTheme}
        style={[styles.iconButton, { width: iconPx, height: iconPx, borderRadius: iconPx / 2 }]}
        accessibilityLabel="Toggle theme"
        accessibilityRole="button"
      >
        <Text style={styles.iconEmoji}>{isDark ? '☀️' : '🌙'}</Text>
      </Pressable>
    );
  }

  const trackW = size === 'small' ? 48 : size === 'large' ? 68 : 56;
  const trackH = size === 'small' ? 28 : size === 'large' ? 36 : 32;
  const thumbSz = trackH - 6;
  const thumbTravel = trackW - thumbSz - 6;

  const thumbX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, thumbTravel],
  });

  return (
    <Pressable
      onPress={toggleTheme}
      style={[
        styles.track,
        {
          width: trackW,
          height: trackH,
          borderRadius: trackH / 2,
          backgroundColor: isDark ? '#4f46e5' : '#d1d5db',
        },
      ]}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="switch"
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSz,
            height: thumbSz,
            borderRadius: thumbSz / 2,
            transform: [{ translateX: thumbX }],
            backgroundColor: isDark ? '#fff' : '#fff',
            top: (trackH - thumbSz) / 2,
          },
        ]}
      >
        <Text style={[styles.thumbEmoji, { fontSize: thumbSz * 0.55 }]}>
          {isDark ? '☀️' : '🌙'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  track: {
    position: 'relative',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbEmoji: {
    lineHeight: undefined,
  },
});
