import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginFormData } from "@/src/schemas/auth.schema";
import { useLogin } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { ErrorBox } from "@/src/components/ui/ErrorBox";

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  const serverError = loginMutation.isError
    ? "Email ou mot de passe incorrect"
    : null;

  return (
    <View>
      {serverError ? <ErrorBox message={serverError} /> : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
            accessibilityLabel="Adresse email"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Mot de passe"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
            accessibilityLabel="Mot de passe"
          />
        )}
      />

      <Button
        label={
          isSubmitting || loginMutation.isPending
            ? "Connexion..."
            : "Se connecter"
        }
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting || loginMutation.isPending}
        className="mt-2"
        accessibilityLabel="Se connecter"
      />
    </View>
  );
}
