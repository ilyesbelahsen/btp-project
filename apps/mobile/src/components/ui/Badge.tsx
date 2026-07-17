import { View, Text } from "react-native";

type BadgeProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
};

export function Badge({
  label,
  color = "#2563eb",
  backgroundColor = "#dbeafe",
}: BadgeProps) {
  return (
    <View
      className="rounded-full px-3.5 py-1.5"
      style={{ backgroundColor }}
      accessibilityRole="text"
    >
      <Text className="text-xs font-bold capitalize" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
