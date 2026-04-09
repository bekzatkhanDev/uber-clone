import { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from "react-native";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";
import { usePlaceSearch, PlaceSearchResult } from "@/hooks/usePlaceSearch";

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState(initialLocation || "");
  const [debouncedQuery, setDebouncedQuery] = useState(initialLocation || "");
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = usePlaceSearch(debouncedQuery);

  const displayResults = useMemo(
    () => (debouncedQuery.length >= 3 ? results : []),
    [results, debouncedQuery]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setShowResults(true);
  };

  const handleSelectResult = (result: PlaceSearchResult) => {
    setShowResults(false);
    setQuery(result.name);
    if (Platform.OS !== "web") {
      const { Keyboard } = require("react-native");
      Keyboard.dismiss();
    }
    handlePress({
      latitude: result.point.lat,
      longitude: result.point.lon,
      address: result.address ? `${result.name}, ${result.address}` : result.name,
    });
  };

  const handleBlur = () => {
    // Delay so tap on result registers before list hides
    setTimeout(() => setShowResults(false), 200);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 3) setShowResults(true);
  };

  const renderResult = ({ item }: { item: PlaceSearchResult }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}
      onPress={() => handleSelectResult(item)}
    >
      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>{item.name}</Text>
      {item.address ? (
        <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }} numberOfLines={1}>{item.address}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    // overflow:visible is critical on web so the dropdown isn't clipped
    <View
      style={{ position: "relative", zIndex: 50, overflow: "visible", flex: 1 }}
      className={`rounded-xl ${containerStyle ?? ""}`}
    >
      {/* Input row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 999,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? "#0286FF" : "transparent",
          backgroundColor: textInputBackgroundColor || "white",
          paddingHorizontal: 16,
          overflow: "hidden",
        }}
      >
        <View style={{ width: 24, height: 24, marginRight: 10, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={icon ?? icons.search}
            style={{ width: 20, height: 20, opacity: 0.5 }}
            resizeMode="contain"
          />
        </View>
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            paddingVertical: 14,
            fontSize: 15,
            color: "#111827",
            // Remove browser default outline — we draw our own border
            outlineStyle: "none" as any,
          }}
          placeholder={initialLocation || "Where do you want to go?"}
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={handleQueryChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="font-JakartaSemiBold"
        />
        {isLoading && <ActivityIndicator size="small" color="#0286FF" style={{ marginLeft: 8 }} />}
      </View>

      {/* Dropdown — absolutely positioned below input with higher z-index */}
      {showResults && displayResults.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: "100%" as any,
            left: 0,
            right: 0,
            marginTop: 6,
            borderRadius: 16,
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            zIndex: 10000,
            maxHeight: 220,
            overflow: "hidden",
          }}
        >
          <FlatList
            data={displayResults}
            renderItem={renderResult}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 220 }}
          />
        </View>
      )}

      {/* No results */}
      {showResults && query.length >= 3 && !isLoading && displayResults.length === 0 && (
        <View
          style={{
            position: "absolute",
            top: "100%" as any,
            left: 0,
            right: 0,
            marginTop: 6,
            borderRadius: 16,
            backgroundColor: "white",
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            zIndex: 10000,
          }}
        >
          <Text style={{ color: "#9ca3af", textAlign: "center", fontSize: 14 }}>No results found</Text>
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
