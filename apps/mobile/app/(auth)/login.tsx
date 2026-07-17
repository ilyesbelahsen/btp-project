import { View, Text } from "react-native";
import { LoginForm } from "@/src/components/forms/LoginForm";

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center text-gray-900 mb-8">
        BTP Manager
      </Text>
      <LoginForm />
    </View>
  );
}
