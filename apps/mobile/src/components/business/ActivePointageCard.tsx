import { View, Text } from "react-native";
import { MapPin } from "lucide-react-native";
import type { Pointage } from "@/src/types/pointage.type";
import { formatTime } from "@/src/utils/date.utils";
import { Button } from "@/src/components/ui/Button";
import { ErrorBox } from "@/src/components/ui/ErrorBox";
import { Square } from "lucide-react-native";

type ActivePointageCardProps = {
  pointage: Pointage;
  onStopRequest: () => void;
  isStopping: boolean;
  errorMsg: string | null;
};

export function ActivePointageCard({
  pointage,
  onStopRequest,
  isStopping,
  errorMsg,
}: ActivePointageCardProps) {
  const since = formatTime(pointage.startTime);

  return (
    <View className="bg-white rounded-xl mx-4 mt-4 p-4 mb-3 border border-green-200">
      <View className="flex-row items-center gap-2 mb-1">
        <View className="w-2.5 h-2.5 rounded-full bg-success" />
        <Text className="text-success font-semibold text-sm">
          Journée en cours
        </Text>
      </View>

      <Text className="text-xs text-gray-500 mb-3">Démarré à {since}</Text>

      {pointage.chantier ? (
        <View className="flex-row items-center gap-1.5 mb-1">
          <MapPin size={14} color="#2563eb" />
          <Text className="text-sm text-primary font-medium">
            {pointage.chantier.name}
          </Text>
        </View>
      ) : null}

      {errorMsg ? <ErrorBox message={errorMsg} /> : null}

      <Button
        label="Terminer la journée"
        variant="danger"
        icon={<Square size={18} color="#fff" style={{ marginRight: 6 }} />}
        onPress={onStopRequest}
        loading={isStopping}
        className="mt-3"
        accessibilityLabel="Terminer la journée"
      />
    </View>
  );
}
