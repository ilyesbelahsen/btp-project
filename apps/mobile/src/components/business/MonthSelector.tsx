import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { moisLabel } from "@/src/utils/date.utils";

type MonthSelectorProps = {
  mois: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function MonthSelector({
  mois,
  onPrevious,
  onNext,
}: MonthSelectorProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
      <TouchableOpacity
        className="p-1.5"
        onPress={onPrevious}
        accessibilityRole="button"
        accessibilityLabel="Mois précédent"
      >
        <ChevronLeft size={20} color="#374151" />
      </TouchableOpacity>

      <View className="flex-row items-center gap-1.5">
        <Calendar size={15} color="#2563eb" />
        <Text className="text-sm font-bold text-gray-900 capitalize">
          {moisLabel(mois)}
        </Text>
      </View>

      <TouchableOpacity
        className="p-1.5"
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Mois suivant"
      >
        <ChevronRight size={20} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}
