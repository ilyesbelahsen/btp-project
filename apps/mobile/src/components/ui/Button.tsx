import { ActivityIndicator, TouchableOpacity, Text } from "react-native";
import type { TouchableOpacityProps } from "react-native";

type ButtonVariant = "primary" | "danger" | "ghost";

type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary rounded-lg py-3.5 px-4 items-center flex-row justify-center",
  danger:
    "bg-danger rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-1.5",
  ghost: "bg-white border border-gray-200 rounded-lg py-3.5 px-4 items-center",
};

const LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white text-base font-semibold",
  danger: "text-white text-sm font-semibold",
  ghost: "text-gray-700 text-base font-medium",
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      className={`${VARIANT_CLASSES[variant]} ${disabled || loading ? "opacity-60" : ""} ${className ?? ""}`.trim()}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon}
          <Text className={LABEL_CLASSES[variant]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
