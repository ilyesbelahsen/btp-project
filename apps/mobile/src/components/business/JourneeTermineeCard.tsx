import { View, Text } from "react-native";
import { CheckCircle } from "lucide-react-native";
import type { CompletedPointage } from "@/src/types/pointage.type";
import { formatDurationLabel } from "@/src/utils/date.utils";
import { Button } from "@/src/components/ui/Button";

type JourneeTermineeCardProps = {
  completedPointage: CompletedPointage;
  onDismiss: () => void;
};

export function JourneeTermineeCard({
  completedPointage,
  onDismiss,
}: JourneeTermineeCardProps) {
  const durationLabel = formatDurationLabel(completedPointage.totalHours);

  return (
    <View className="flex-1 bg-gray-50 justify-center p-6">
      <View className="bg-white rounded-2xl p-8 items-center">
        <CheckCircle size={56} color="#16a34a" />

        <Text className="text-2xl font-bold text-gray-900 mt-4">
          Journée terminée !
        </Text>

        <Text className="text-base text-gray-500 mt-1 mb-6">
          {completedPointage.chantierName}
        </Text>

        <View className="bg-success-light rounded-xl px-8 py-4 items-center w-full mb-6">
          <Text className="text-xs text-gray-500 mb-1">Durée</Text>
          <Text className="text-3xl font-bold text-success">
            {durationLabel}
          </Text>
        </View>

        <Button
          label="OK"
          onPress={onDismiss}
          className="w-full"
          accessibilityLabel="Fermer le récapitulatif"
        />
      </View>
    </View>
  );
}
