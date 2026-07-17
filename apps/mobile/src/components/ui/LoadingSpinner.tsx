import { ActivityIndicator, View } from "react-native";

type LoadingSpinnerProps = {
  size?: "small" | "large";
  color?: string;
};

export function LoadingSpinner({
  size = "large",
  color = "#2563eb",
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
