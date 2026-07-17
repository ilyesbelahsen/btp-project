import { TextInput, Text, View } from "react-native";
import type { TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  error?: string;
};

export function Input({ error, ...props }: InputProps) {
  return (
    <View className="mb-2">
      <TextInput
        className={`border rounded-lg p-3 text-base text-gray-900 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
