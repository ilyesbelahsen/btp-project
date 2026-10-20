import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/src/stores/auth.store";

// Splash screen — AuthGuard in _layout.tsx handles all routing once hydrated
export default function Index() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return null;
}
