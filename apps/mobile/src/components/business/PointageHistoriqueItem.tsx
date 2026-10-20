import { View, Text } from "react-native";
import { Clock } from "lucide-react-native";
import type { Pointage } from "@/src/types/pointage.type";
import { STATUS_CONFIG } from "@/src/constants/theme";
import {
  formatDate,
  formatTime,
  formatDurationMinutes,
} from "@/src/utils/date.utils";

type PointageHistoriqueItemProps = {
  pointage: Pointage;
};

export function PointageHistoriqueItem({
  pointage,
}: PointageHistoriqueItemProps) {
  const statusConfig = STATUS_CONFIG[
    pointage.status as keyof typeof STATUS_CONFIG
  ] ?? {
    label: pointage.status,
    color: "#6b7280",
  };

  return (
    <View className="bg-white rounded-xl p-4 mx-4 mb-2.5">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-gray-800">
          {formatDate(pointage.startTime)}
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: statusConfig.color + "1a" }}
        >
          <Text
            className="text-[11px] font-semibold"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {pointage.chantier ? (
        <Text className="text-xs text-gray-500 mb-2">
          {pointage.chantier.name}
        </Text>
      ) : null}

      {pointage.status === "REJETE" && pointage.rejectionReason ? (
        <View className="rounded-lg bg-red-50 px-3 py-2 mb-2">
          <Text className="text-xs font-semibold text-red-700">
            Motif du rejet
          </Text>
          <Text className="text-xs text-red-600 mt-0.5">
            {pointage.rejectionReason}
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-4 mt-1">
        <View className="items-center">
          <Text className="text-[10px] text-gray-400">Début</Text>
          <Text className="text-sm font-medium text-gray-700">
            {formatTime(pointage.startTime)}
          </Text>
        </View>

        <View className="w-px h-6 bg-gray-200" />

        <View className="items-center">
          <Text className="text-[10px] text-gray-400">Fin</Text>
          <Text className="text-sm font-medium text-gray-700">
            {pointage.endTime ? formatTime(pointage.endTime) : "—"}
          </Text>
        </View>

        <View className="w-px h-6 bg-gray-200" />

        <View className="items-center">
          <Text className="text-[10px] text-gray-400">Durée</Text>
          <View className="flex-row items-center gap-1">
            <Clock size={11} color="#2563eb" />
            <Text className="text-sm font-bold text-primary">
              {formatDurationMinutes(
                pointage.totalMinutes ??
                  (pointage.totalHours == null
                    ? null
                    : Math.round(pointage.totalHours * 60)),
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
