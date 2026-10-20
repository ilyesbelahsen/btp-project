import { View, Text } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import type { Pointage } from "@/src/types/pointage.type";
import { formatTime, elapsedDurationLabel } from "@/src/utils/date.utils";
import { ErrorBox } from "@/src/components/ui/ErrorBox";

type ActivePointageCardProps = {
  pointage: Pointage;
  errorMsg: string | null;
};

export function ActivePointageCard({
  pointage,
  errorMsg,
}: ActivePointageCardProps) {
  const [elapsed, setElapsed] = useState(() =>
    elapsedDurationLabel(pointage.startTime),
  );

  // Tick every second — DOM only updates when the formatted string changes (once/min)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(elapsedDurationLabel(pointage.startTime));
    }, 1_000);
    return () => clearInterval(timer);
  }, [pointage.startTime]);

  return (
    <View className="bg-brand px-5 pt-5 pb-6 border-b-4 border-primary">
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <Text className="text-emerald-400 font-bold text-xs tracking-widest uppercase">
            Pointage en cours
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#a8a29e" />
          <Text className="text-xs text-stone-400">
            depuis {formatTime(pointage.startTime)}
          </Text>
        </View>
      </View>

      <Text className="text-6xl font-bold text-white mb-5">{elapsed}</Text>

      {pointage.chantier ? (
        <View className="flex-row items-center gap-2 bg-brand-muted px-3 py-3 rounded-lg border border-stone-700">
          <MapPin size={16} color="#fb923c" />
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Chantier
            </Text>
            <Text className="text-sm text-white font-semibold mt-0.5">
              {pointage.chantier.name}
            </Text>
          </View>
        </View>
      ) : null}

      {errorMsg ? (
        <View className="mt-4 w-full">
          <ErrorBox message={errorMsg} />
        </View>
      ) : null}
    </View>
  );
}
