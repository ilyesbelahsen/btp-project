import {
  TextInput,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Button } from "@/src/components/ui/Button";

type CommentInputProps = {
  value: string;
  onChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
};

const MAX_LENGTH = 500;

export function CommentInput({
  value,
  onChange,
  onSave,
  isSaving,
  isSaved,
}: CommentInputProps) {
  return (
    <View className="bg-white rounded-xl mx-4 p-4 mb-3">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Commentaire patron
      </Text>

      <TextInput
        className="border border-gray-200 rounded-lg p-3 text-sm text-gray-800 min-h-[80px]"
        multiline
        numberOfLines={3}
        maxLength={MAX_LENGTH}
        placeholder="Informations à transmettre au patron…"
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChange}
        textAlignVertical="top"
        accessibilityLabel="Commentaire pour le patron"
      />

      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-gray-400">
          {value.length}/{MAX_LENGTH}
        </Text>

        {value.length > 0 ? (
          isSaving ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <TouchableOpacity
              className="bg-primary rounded-lg px-3 py-1.5"
              onPress={onSave}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Sauvegarder le commentaire"
            >
              <Text className="text-white text-xs font-semibold">
                {isSaved ? "✓ Envoyé" : "Sauvegarder"}
              </Text>
            </TouchableOpacity>
          )
        ) : null}
      </View>
    </View>
  );
}
