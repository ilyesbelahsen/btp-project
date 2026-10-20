import { Text, TextInput, View } from "react-native";
import { MessageSquare } from "lucide-react-native";

const COMMENT_MAX_LENGTH = 500;

type PointageCommentInputProps = {
  value: string;
  onChange: (comment: string) => void;
};

export function PointageCommentInput({
  value,
  onChange,
}: PointageCommentInputProps) {
  return (
    <View className="bg-white mx-4 mt-4 rounded-xl p-4 border border-stone-200">
      <View className="flex-row items-center gap-2 mb-2">
        <MessageSquare size={16} color="#ea580c" />
        <Text className="text-sm font-semibold text-gray-800">
          Commentaire terrain
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Signaler un problème, un retard ou une information utile"
        placeholderTextColor="#9ca3af"
        multiline
        maxLength={COMMENT_MAX_LENGTH}
        textAlignVertical="top"
        className="min-h-[88px] rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-gray-800"
        accessibilityLabel="Commentaire terrain"
      />
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xs text-gray-400">
          {value.length}/{COMMENT_MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}
