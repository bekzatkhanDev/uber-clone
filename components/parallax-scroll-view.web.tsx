import type { PropsWithChildren, ReactElement } from "react";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

// Web fallback: no reanimated dependency for the parallax effect
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
        ]}
      >
        {headerImage}
      </View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
  },
});

