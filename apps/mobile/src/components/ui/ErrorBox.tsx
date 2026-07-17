import { View, Text } from "react-native";

type ErrorBoxProps = {
  message: string;
};

export function ErrorBox({ message }: ErrorBoxProps) {
  return (
    <View className="bg-danger-light rounded-lg p-3 mb-4">
      <Text className="text-danger text-sm text-center">{message}</Text>
    </View>
  );
}
