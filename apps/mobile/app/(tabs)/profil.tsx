import { View, Text, ActivityIndicator } from 'react-native';
import { User, LogOut } from 'lucide-react-native';
import { useAuthStore } from '@/src/stores/auth.store';
import { useLogout } from '@/src/hooks/useAuth';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { COLORS } from '@/src/constants/theme';

export default function ProfilScreen() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-between">
      <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
        <View className="w-20 h-20 rounded-full bg-primary-light justify-center items-center mb-4">
          <User size={40} color={COLORS.primary} />
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-1">
          {user?.firstName} {user?.lastName}
        </Text>

        <Text className="text-sm text-gray-400 mb-4">{user?.email}</Text>

        {user?.role ? (
          <Badge label={user.role} color={COLORS.primary} backgroundColor={COLORS.primaryLight} />
        ) : null}
      </View>

      <Button
        label="Se déconnecter"
        variant="danger"
        icon={
          logoutMutation.isPending ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 6 }} />
          ) : (
            <LogOut size={18} color="#fff" style={{ marginRight: 6 }} />
          )
        }
        onPress={() => logoutMutation.mutate()}
        loading={logoutMutation.isPending}
        className="self-center"
        accessibilityLabel="Se déconnecter"
      />
    </View>
  );
}
