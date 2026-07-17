import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { MapPin } from "lucide-react-native";
import type { Chantier } from "@/src/types/chantier.type";
import { Button } from "@/src/components/ui/Button";
import { ErrorBox } from "@/src/components/ui/ErrorBox";

type ChantierSelectorProps = {
  chantiers: Chantier[] | undefined;
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStart: () => void;
  isPending: boolean;
  errorMsg: string | null;
};

export function ChantierSelector({
  chantiers,
  loading,
  selectedId,
  onSelect,
  onStart,
  isPending,
  errorMsg,
}: ChantierSelectorProps) {
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  if (!chantiers?.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-base">
          Aucun chantier actif affecté
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800 px-4 pt-4 pb-2">
        Choisissez votre chantier
      </Text>

      {errorMsg ? (
        <View className="px-4">
          <ErrorBox message={errorMsg} />
        </View>
      ) : null}

      <FlatList
        data={chantiers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              className={`flex-row items-center gap-3 p-4 rounded-xl border ${
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() => onSelect(isSelected ? null : item.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={item.name}
            >
              <MapPin size={16} color={isSelected ? "#2563eb" : "#9ca3af"} />
              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-gray-800"}`}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">{item.address}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selectedId ? (
        <View className="p-4">
          <Button
            label="Démarrer la journée"
            onPress={onStart}
            loading={isPending}
            accessibilityLabel="Démarrer la journée"
          />
        </View>
      ) : null}
    </View>
  );
}
