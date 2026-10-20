import { View, Text } from "react-native";
import { HardHat } from "lucide-react-native";
import { LoginForm } from "@/src/components/forms/LoginForm";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-stone-950">
      <View className="flex-1 items-center justify-center px-8 pt-16 pb-10">
        <View className="bg-primary rounded-2xl p-4 mb-5">
          <HardHat size={40} color="#fff" />
        </View>
        <Text className="text-4xl font-bold text-white tracking-tight">
          BTP Manager
        </Text>
        <Text className="text-primary text-sm font-semibold tracking-widest uppercase mt-1">
          Gestion de chantier
        </Text>
      </View>

      <View className="bg-white rounded-t-3xl px-6 pt-8 pb-12">
        <Text className="text-xl font-bold text-gray-900 mb-6">Connexion</Text>
        <LoginForm />
      </View>
    </View>
  );
}
