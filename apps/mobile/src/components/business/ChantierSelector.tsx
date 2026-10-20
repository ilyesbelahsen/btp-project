import {
  ScrollView,
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
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-gray-500 text-base text-center">
          Aucun chantier actif affecté
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 10 }}
      >
        <Text className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
          Nouveau pointage
        </Text>
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Quel chantier aujourd'hui ?
        </Text>
        <Text className="text-sm text-stone-500 mb-4">
          Sélectionnez votre lieu de travail pour commencer.
        </Text>

        {chantiers.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center gap-3 p-4 rounded-xl border-l-4 ${
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-stone-200 bg-white"
              }`}
              onPress={() => onSelect(isSelected ? null : item.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={item.name}
            >
              <MapPin size={20} color={isSelected ? "#2563eb" : "#9ca3af"} />
              <View className="flex-1">
                <Text
                  className={`text-base font-semibold ${isSelected ? "text-primary" : "text-gray-800"}`}
                >
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {item.address}
                </Text>
              </View>
              {isSelected ? (
                <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="px-4 pt-3 pb-8 bg-white border-t-2 border-stone-200">
        {errorMsg ? <ErrorBox message={errorMsg} /> : null}
        <Button
          label="Démarrer ma journée"
          onPress={onStart}
          loading={isPending}
          disabled={!selectedId}
          className="mt-2"
          accessibilityLabel="Démarrer la journée"
        />
      </View>
    </View>
  );
}
