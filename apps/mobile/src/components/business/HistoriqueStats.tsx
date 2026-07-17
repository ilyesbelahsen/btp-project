import { View, Text } from "react-native";
import { Clock, BarChart2, Calendar } from "lucide-react-native";
import type { PointageStats } from "@/src/types/pointage.type";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { formatDuration } from "@/src/utils/date.utils";

type HistoriqueStatsProps = {
  stats: PointageStats | undefined;
  isLoading: boolean;
};

export function HistoriqueStats({ stats, isLoading }: HistoriqueStatsProps) {
  if (isLoading) {
    return (
      <View className="h-16 justify-center items-center">
        <LoadingSpinner size="small" />
      </View>
    );
  }

  const dernierPointageLabel = stats?.dernierPointage
    ? new Date(stats.dernierPointage).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      })
    : "—";

  return (
    <View className="flex-row items-center justify-around py-3.5 px-2 bg-white border-b border-gray-100">
      <View className="items-center gap-1">
        <Clock size={14} color="#2563eb" />
        <Text className="text-sm font-bold text-gray-900">
          {stats ? formatDuration(stats.totalHeures) : "—"}
        </Text>
        <Text className="text-[11px] text-gray-500">Total heures</Text>
      </View>

      <View className="w-px h-8 bg-gray-200" />

      <View className="items-center gap-1">
        <BarChart2 size={14} color="#16a34a" />
        <Text className="text-sm font-bold text-gray-900">
          {stats?.totalJours ?? "—"}
        </Text>
        <Text className="text-[11px] text-gray-500">Jours travaillés</Text>
      </View>

      <View className="w-px h-8 bg-gray-200" />

      <View className="items-center gap-1">
        <Calendar size={14} color="#f59e0b" />
        <Text className="text-sm font-bold text-gray-900">
          {dernierPointageLabel}
        </Text>
        <Text className="text-[11px] text-gray-500">Dernier pointage</Text>
      </View>
    </View>
  );
}
