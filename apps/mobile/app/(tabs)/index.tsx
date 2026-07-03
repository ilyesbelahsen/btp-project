import { View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { chantierApi } from "@/services/chantier.api";

export default function ChantiersScreen() {
  const { data: chantiers, isLoading } = useQuery({
    queryKey: ["chantiers"],
    queryFn: () => chantierApi.findAll().then((r) => r.data),
  });

  if (isLoading)
    return (
      <View style={styles.center}>
        <Text>Chargement...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={chantiers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <Text
              style={[
                styles.status,
                item.status === "EN_COURS" && styles.active,
              ]}
            >
              {item.status}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "600" },
  address: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  status: { fontSize: 12, color: "#9ca3af", marginTop: 8 },
  active: { color: "#16a34a" },
});
