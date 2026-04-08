import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
  Platform,
  TouchableOpacity,
} from "react-native";

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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Pressable onPress={() => Keyboard.dismiss()}>
        <View className="my-2 w-full">
          <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
            {label}
          </Text>
          <View
            className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
          >
            {icon && (
              <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
            )}
            <TextInput
              className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              {...props}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((v) => !v)}
                className="mr-4"
              >
                <Image
                  source={icons.eyecross}
                  className={`w-6 h-6 ${isPasswordVisible ? "opacity-50" : ""}`}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default InputField;
