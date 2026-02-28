import { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
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
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = usePlaceSearch(debouncedQuery);

  const displayResults = useMemo(() => {
    return debouncedQuery.length >= 3 ? results : [];
  }, [results, debouncedQuery]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setShowResults(true);
  };

  const handleSelectResult = (result: PlaceSearchResult) => {
    setShowResults(false);
    setQuery(result.name);
    Keyboard.dismiss();

    handlePress({
      latitude: result.point.lat,
      longitude: result.point.lon,
      address: result.address ? `${result.name}, ${result.address}` : result.name,
    });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleFocus = () => {
    if (query.length >= 3) {
      setShowResults(true);
    }
  };

  const renderResult = ({ item }: { item: PlaceSearchResult }) => (
    <TouchableOpacity
      className="p-3 border-b border-gray-200"
      onPress={() => handleSelectResult(item)}
    >
      <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
      {item.address ? (
        <Text className="text-sm text-gray-500 mt-1">{item.address}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <View className="flex-1 relative">
        <View
          className="flex flex-row items-center rounded-full px-4"
          style={{
            backgroundColor: textInputBackgroundColor || "white",
          }}
        >
          <View className="justify-center items-center w-6 h-6 mr-3">
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
          <TextInput
            ref={inputRef}
            className="flex-1 py-3 text-base font-semibold"
            placeholder={initialLocation || "Where do you want to go?"}
            placeholderTextColor="gray"
            value={query}
            onChangeText={handleQueryChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {isLoading && (
            <ActivityIndicator size="small" color="#0286FF" />
          )}
        </View>

        {/* Список результатов поиска */}
        {showResults && displayResults.length > 0 && (
          <View
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white shadow-lg"
            style={{ zIndex: 9999, maxHeight: 200 }}
          >
            <FlatList
              data={displayResults}
              renderItem={renderResult}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Нет результатов */}
        {showResults && query.length >= 3 && !isLoading && displayResults.length === 0 && (
          <View
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white shadow-lg p-4"
            style={{ zIndex: 9999 }}
          >
            <Text className="text-gray-500 text-center">No results found</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default GoogleTextInput;
