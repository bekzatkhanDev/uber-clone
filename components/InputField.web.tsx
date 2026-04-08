// Web InputField — no KeyboardAvoidingView, no Pressable (they block TextInput focus on web)
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import { icons } from "@/constants";
import { InputFieldProps } from "@/types/type";
import { useState } from "react";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginVertical: 8, width: "100%" }}>
      {label && (
        <Text
          style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}
          className={`font-JakartaSemiBold ${labelStyle ?? ""}`}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 999,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? "#0286FF" : "#e5e5e5",
          overflow: "hidden",
        }}
        className={containerStyle ?? ""}
      >
        {icon && (
          <Image
            source={icon}
            style={{ width: 24, height: 24, marginLeft: 16, opacity: 0.55 }}
            resizeMode="contain"
            className={iconStyle ?? ""}
          />
        )}
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 16,
            fontSize: 15,
            color: "#000",
            // Crucial for web: remove the default browser outline
            outlineStyle: "none" as any,
          }}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`font-JakartaSemiBold ${inputStyle ?? ""}`}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((v) => !v)}
            style={{ paddingRight: 16 }}
          >
            <Image
              source={icons.eyecross}
              style={{
                width: 24,
                height: 24,
                opacity: isPasswordVisible ? 0.4 : 0.55,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;
