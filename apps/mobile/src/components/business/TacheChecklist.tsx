import { useState } from "react";
import { PanResponder, Text, TouchableOpacity, View } from "react-native";

import type { TacheChantier } from "@/src/types/chantier.type";

type TacheChecklistProps = {
  taches: TacheChantier[] | undefined;
  selectedTaches: string[];
  onToggle: (tache: string) => void;
  mode?: "selection" | "repartition";
  durations?: Record<string, number>;
  onBoundaryChange?: (
    leftTaskId: string,
    rightTaskId: string,
    leftMinutes: number,
  ) => void;
  actualMinutes?: number;
};

type AllocationTask = {
  id: string;
  label: string;
  minutes: number;
};

const SEGMENT_COLORS = [
  "#ea580c",
  "#2563eb",
  "#059669",
  "#ca8a04",
  "#db2777",
  "#7c3aed",
];

type AllocationBoundaryProps = {
  leftTaskId: string;
  rightTaskId: string;
  positionPercent: number;
  positionPixels: number;
  trackWidth: number;
  totalMinutes: number;
  minutesBeforeBoundary: number;
  pairTotalMinutes: number;
  onChange: (leftTaskId: string, rightTaskId: string, minutes: number) => void;
};

function AllocationBoundary({
  leftTaskId,
  rightTaskId,
  positionPercent,
  positionPixels,
  trackWidth,
  totalMinutes,
  minutesBeforeBoundary,
  pairTotalMinutes,
  onChange,
}: AllocationBoundaryProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (trackWidth <= 0 || totalMinutes <= 0) return;

      const nextPosition = Math.max(
        0,
        Math.min(trackWidth, positionPixels + gestureState.dx),
      );
      const nextLeftMinutes = Math.round(
        (nextPosition / trackWidth) * totalMinutes - minutesBeforeBoundary,
      );
      onChange(
        leftTaskId,
        rightTaskId,
        Math.max(0, Math.min(pairTotalMinutes, nextLeftMinutes)),
      );
    },
  });

  return (
    <View
      className="absolute z-10 h-10 w-7 items-center justify-center"
      style={{ left: `${positionPercent}%`, marginLeft: -14 }}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Séparateur de répartition"
      accessibilityValue={{ min: 0, max: pairTotalMinutes }}
    >
      <View className="h-7 w-1 rounded-full border border-white bg-stone-700" />
    </View>
  );
}

function TaskAllocationBar({
  tasks,
  totalMinutes,
  onBoundaryChange,
}: {
  tasks: AllocationTask[];
  totalMinutes: number;
  onBoundaryChange: TacheChecklistProps["onBoundaryChange"];
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  let minutesBeforeBoundary = 0;

  return (
    <View
      className="h-12 justify-center"
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <View className="h-6 flex-row overflow-hidden rounded-lg bg-stone-200">
        {tasks.map((task, index) => (
          <View
            key={task.id}
            className="h-6 items-center justify-center"
            style={{
              width:
                totalMinutes > 0
                  ? `${(task.minutes / totalMinutes) * 100}%`
                  : "0%",
              backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
            }}
          >
            {task.minutes >= 15 ? (
              <Text className="text-[10px] font-bold text-white">
                {formatMinutes(task.minutes)}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
      {tasks.slice(0, -1).map((task, index) => {
        minutesBeforeBoundary += task.minutes;
        const rightTask = tasks[index + 1];
        const pairTotalMinutes = task.minutes + rightTask.minutes;

        return (
          <AllocationBoundary
            key={`${task.id}-${rightTask.id}`}
            leftTaskId={task.id}
            rightTaskId={rightTask.id}
            positionPercent={
              totalMinutes > 0
                ? (minutesBeforeBoundary / totalMinutes) * 100
                : 0
            }
            positionPixels={
              totalMinutes > 0
                ? (minutesBeforeBoundary / totalMinutes) * trackWidth
                : 0
            }
            trackWidth={trackWidth}
            totalMinutes={totalMinutes}
            minutesBeforeBoundary={minutesBeforeBoundary - task.minutes}
            pairTotalMinutes={pairTotalMinutes}
            onChange={onBoundaryChange ?? (() => undefined)}
          />
        );
      })}
    </View>
  );
}

export function TacheChecklist({
  taches,
  selectedTaches,
  onToggle,
  mode = "selection",
  durations = {},
  onBoundaryChange,
  actualMinutes = 0,
}: TacheChecklistProps) {
  const allocationTasks = (taches ?? [])
    .filter((tache) => selectedTaches.includes(tache.id))
    .map((tache) => ({
      id: tache.id,
      label: tache.libelle,
      minutes: durations[tache.id] ?? 0,
    }));

  return (
    <View className="mx-4 mb-3 rounded-xl border border-stone-200 bg-white p-4">
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
        {mode === "repartition" ? "Répartir les heures" : "Tâches du chantier"}
      </Text>

      {mode === "repartition" ? (
        <View className="gap-3">
          <View className="gap-1">
            <Text className="text-xs text-gray-600">
              Total pointé : {formatMinutes(actualMinutes)}
            </Text>
            <Text className="text-xs text-gray-500">
              Faites glisser les séparateurs entre les tâches.
            </Text>
          </View>
          <TaskAllocationBar
            tasks={allocationTasks}
            totalMinutes={actualMinutes}
            onBoundaryChange={onBoundaryChange}
          />
          <View className="gap-2">
            {allocationTasks.map((task, index) => (
              <View key={task.id} className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                  }}
                />
                <Text className="flex-1 text-sm text-gray-700">
                  {task.label}
                </Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {formatMinutes(task.minutes)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : taches?.length ? (
        <View className="flex-row flex-wrap gap-2">
          {taches.map((tache) => {
            const isActive = selectedTaches.includes(tache.id);

            return (
              <TouchableOpacity
                key={tache.id}
                className={`rounded-lg border px-3 py-1.5 ${
                  isActive
                    ? "border-primary bg-primary"
                    : "border-gray-300 bg-white"
                }`}
                onPress={() => onToggle(tache.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={tache.libelle}
              >
                <Text
                  className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-600"}`}
                >
                  {tache.libelle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text className="text-sm text-gray-500">
          Aucune tâche disponible pour ce chantier.
        </Text>
      )}
    </View>
  );
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} h`;
  return `${hours} h ${remainingMinutes.toString().padStart(2, "0")}`;
}
