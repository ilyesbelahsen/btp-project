import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointageApi } from "@/services/pointage.api";

export default function PointageScreen() {
  const queryClient = useQueryClient();

  const { data: pointages } = useQuery({
    queryKey: ["pointages"],
    queryFn: () => pointageApi.findAll().then((r) => r.data),
  });

  const activePointage = pointages?.find((p) => p.status === "EN_COURS");

  const stopMutation = useMutation({
    mutationFn: (id: string) => pointageApi.stop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pointages"] }),
    onError: () => Alert.alert("Erreur", "Impossible d'arrêter le pointage"),
  });

  return (
    <View style={styles.container}>
      {activePointage ? (
        <View style={styles.active}>
          <Text style={styles.label}>Pointage en cours</Text>
          <Text style={styles.time}>
            {new Date(activePointage.startTime).toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => stopMutation.mutate(activePointage.id)}
            disabled={stopMutation.isPending}
          >
            <Text style={styles.buttonText}>Terminer la journée</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.label}>Aucun pointage en cours</Text>
          <Text style={styles.hint}>
            Sélectionnez un chantier pour démarrer
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  active: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 18, fontWeight: "600" },
  time: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2563eb",
    marginVertical: 16,
  },
  hint: { fontSize: 14, color: "#6b7280", marginTop: 8 },
  stopButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
