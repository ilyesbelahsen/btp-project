import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { Button } from "@/src/components/ui/Button";

type TacheChecklistProps = {
  typesTaches: string[] | undefined;
  selectedTaches: string[];
  onToggle: (tache: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
};

export function TacheChecklist({
  typesTaches,
  selectedTaches,
  onToggle,
  onSave,
  isSaving,
  isSaved,
}: TacheChecklistProps) {
  return (
    <View className="bg-white rounded-xl mx-4 p-4 mb-3">
      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Activités du jour
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {(typesTaches ?? []).map((tache) => {
          const isActive = selectedTaches.includes(tache);
          return (
            <TouchableOpacity
              key={tache}
              className={`px-3 py-1.5 rounded-full border ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-300"
              }`}
              onPress={() => onToggle(tache)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={tache}
            >
              <Text
                className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-600"}`}
              >
                {tache.charAt(0) + tache.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedTaches.length > 0 ? (
        <View className="mt-3">
          {isSaving ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Button
              label={
                isSaved
                  ? "✓ Sauvegardé"
                  : `Sauvegarder (${selectedTaches.length})`
              }
              onPress={onSave}
              loading={isSaving}
              accessibilityLabel="Sauvegarder les activités"
            />
          )}
        </View>
      ) : null}
    </View>
  );
}
