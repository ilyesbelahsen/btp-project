import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LogOut, User } from "lucide-react-native";

import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/services/auth.api";

export default function ProfilScreen() {
  const { user, refreshToken, clearAuth } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const confirmLogout = async () => {
    setIsLoading(true);

    // Déconnexion côté serveur (sans bloquer l'UI)
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    clearAuth();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <User size={40} color="#2563eb" />
        </View>

        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={confirmLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LogOut size={18} color="#fff" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 24,
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },

  email: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 18,
  },

  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },

  logoutButton: {
    alignSelf: "center",
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
