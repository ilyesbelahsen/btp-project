import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  BarChart2,
} from "lucide-react-native";
import { pointageApi } from "@/services/pointage.api";

const LIMIT = 10;

// Retourne le mois courant au format YYYY-MM
function currentMois() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Décale un mois YYYY-MM de +/- N
function shiftMois(mois: string, delta: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function moisLabel(mois: string): string {
  const [y, m] = mois.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(hours?: number | null) {
  if (!hours) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  EN_COURS: { label: "En cours", color: "#2563eb" },
  TERMINE: { label: "Terminé", color: "#16a34a" },
  VALIDE: { label: "Validé", color: "#7c3aed" },
};

export default function HistoriqueScreen() {
  const [page, setPage] = useState(1);
  const [moisFilter, setMoisFilter] = useState(currentMois());

  const handleSetMois = (m: string) => {
    setMoisFilter(m);
    setPage(1);
  };

  // Stats du mois sélectionné (CA1 / CA3 : calcul exclusivement API)
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["mes-stats", moisFilter],
    queryFn: () => pointageApi.getMesStats(moisFilter).then((r) => r.data),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["historique", page, moisFilter],
    queryFn: () =>
      pointageApi
        .getHistorique({ page, limit: LIMIT, mois: moisFilter })
        .then((r) => r.data),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const pointages = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <View style={styles.container}>
      {/* Sélecteur de mois */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => handleSetMois(shiftMois(moisFilter, -1))}
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View style={styles.monthLabelWrap}>
          <Calendar size={15} color="#2563eb" />
          <Text style={styles.monthLabel}>{moisLabel(moisFilter)}</Text>
        </View>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => handleSetMois(shiftMois(moisFilter, 1))}
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Bandeau stats (CA4 — calcul API, BR-020) */}
      <View style={styles.statsBar}>
        {loadingStats ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <>
            <View style={styles.statItem}>
              <Clock size={14} color="#2563eb" />
              <Text style={styles.statValue}>
                {stats
                  ? `${Math.floor(stats.totalHeures)}h${String(Math.round((stats.totalHeures % 1) * 60)).padStart(2, "0")}`
                  : "—"}
              </Text>
              <Text style={styles.statLabel}>Total heures</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <BarChart2 size={14} color="#16a34a" />
              <Text style={styles.statValue}>{stats?.totalJours ?? "—"}</Text>
              <Text style={styles.statLabel}>Jours travaillés</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Calendar size={14} color="#f59e0b" />
              <Text style={styles.statValue}>
                {stats?.dernierPointage
                  ? new Date(stats.dernierPointage).toLocaleDateString(
                      "fr-FR",
                      { day: "2-digit", month: "2-digit" },
                    )
                  : "—"}
              </Text>
              <Text style={styles.statLabel}>Dernier pointage</Text>
            </View>
          </>
        )}
      </View>

      {pointages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun pointage enregistré</Text>
        </View>
      ) : (
        <FlatList
          data={pointages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const statusInfo = STATUS_LABELS[item.status] ?? {
              label: item.status,
              color: "#6b7280",
            };
            return (
              <View style={styles.card}>
                {/* Date + chantier */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>
                    {formatDate(item.startTime)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.color + "1a" },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusInfo.color }]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {item.chantier && (
                  <Text style={styles.chantierName}>{item.chantier.name}</Text>
                )}

                {/* Horaires + durée */}
                <View style={styles.horaireRow}>
                  <View style={styles.horaireItem}>
                    <Text style={styles.horaireLabel}>Début</Text>
                    <Text style={styles.horaireValue}>
                      {formatTime(item.startTime)}
                    </Text>
                  </View>
                  <View style={styles.horaireSep} />
                  <View style={styles.horaireItem}>
                    <Text style={styles.horaireLabel}>Fin</Text>
                    <Text style={styles.horaireValue}>
                      {item.endTime ? formatTime(item.endTime) : "—"}
                    </Text>
                  </View>
                  <View style={styles.horaireSep} />
                  <View style={styles.horaireItem}>
                    <Text style={styles.horaireLabel}>Durée</Text>
                    <Text style={[styles.horaireValue, styles.durationValue]}>
                      {formatDuration(item.totalHours)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft size={20} color={page === 1 ? "#d1d5db" : "#374151"} />
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            {page} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageBtn,
              page === totalPages && styles.pageBtnDisabled,
            ]}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
          >
            <ChevronRight
              size={20}
              color={page === totalPages ? "#d1d5db" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 15, color: "#6b7280" },
  // ── Sélecteur de mois ────────────────────────────────────────────────────
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  monthArrow: { padding: 6 },
  monthLabelWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },
  // ── Bandeau stats ────────────────────────────────────────────────────────
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    minHeight: 72,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#9ca3af", textAlign: "center" },
  statDivider: { width: 1, height: 40, backgroundColor: "#f1f5f9" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: { fontSize: 14, fontWeight: "700", color: "#111827" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  chantierName: { fontSize: 13, color: "#6b7280" },
  horaireRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },
  horaireItem: { flex: 1, alignItems: "center" },
  horaireLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 2 },
  horaireValue: { fontSize: 14, fontWeight: "600", color: "#374151" },
  durationValue: { color: "#2563eb" },
  horaireSep: { width: 1, height: 28, backgroundColor: "#e5e7eb" },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  pageBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  pageBtnDisabled: { backgroundColor: "#f9fafb" },
  pageInfo: { fontSize: 14, fontWeight: "600", color: "#374151" },
});
