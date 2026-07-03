import { View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { depenseApi } from "@/services/depense.api";

export default function DepensesScreen() {
  const { data: depenses, isLoading } = useQuery({
    queryKey: ["depenses"],
    queryFn: () => depenseApi.findAll().then((r) => r.data),
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
        data={depenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.amount}>{item.montant.toFixed(2)} €</Text>
            </View>
            <Text style={styles.categorie}>{item.categorie}</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: { fontSize: 15, fontWeight: "500", flex: 1 },
  amount: { fontSize: 16, fontWeight: "700", color: "#dc2626" },
  categorie: { fontSize: 12, color: "#6b7280", marginTop: 4 },
});
