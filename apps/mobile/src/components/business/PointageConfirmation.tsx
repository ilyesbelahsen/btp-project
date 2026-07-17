import { View, Text } from "react-native";
import { AlertCircle, Clock, MapPin } from "lucide-react-native";
import type { Pointage } from "@/src/types/pointage.type";
import { formatTime, elapsedDurationLabel } from "@/src/utils/date.utils";
import { Button } from "@/src/components/ui/Button";

type PointageConfirmationProps = {
  pointage: Pointage;
  onConfirm: () => void;
  onCancel: () => void;
  isStopping: boolean;
};

export function PointageConfirmation({
  pointage,
  onConfirm,
  onCancel,
  isStopping,
}: PointageConfirmationProps) {
  const since = formatTime(pointage.startTime);
  const until = formatTime(new Date().toISOString());
  const durationLabel = elapsedDurationLabel(pointage.startTime);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-2xl p-6 mb-4">
        <View className="items-center mb-4">
          <AlertCircle size={32} color="#f59e0b" />
          <Text className="text-lg font-bold text-gray-900 mt-2">
            Confirmer la fin de journée
          </Text>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-sm text-gray-500 w-16">Chantier</Text>
            <Text className="text-sm font-semibold text-gray-800 flex-1">
              {pointage.chantier?.name ?? "—"}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#6b7280" />
            <Text className="text-sm text-gray-500 w-16">Début</Text>
            <Text className="text-sm font-semibold text-gray-800">{since}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#6b7280" />
            <Text className="text-sm text-gray-500 w-16">Fin</Text>
            <Text className="text-sm font-semibold text-gray-800">{until}</Text>
          </View>
        </View>

        <View className="bg-primary-light rounded-xl p-4 mt-4 items-center">
          <Text className="text-xs text-gray-500">Durée estimée</Text>
          <Text className="text-2xl font-bold text-primary mt-0.5">
            {durationLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Button
          label="Annuler"
          variant="ghost"
          onPress={onCancel}
          className="flex-1"
          accessibilityLabel="Annuler la fin de journée"
        />
        <Button
          label="Confirmer"
          onPress={onConfirm}
          loading={isStopping}
          className="flex-1"
          accessibilityLabel="Confirmer la fin de journée"
        />
      </View>
    </View>
  );
}
