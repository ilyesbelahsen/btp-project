import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Play,
  Square,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { chantierApi } from "@/services/chantier.api";
import { pointageApi } from "@/services/pointage.api";

export default function PointageScreen() {
  const queryClient = useQueryClient();
  const [selectedChantierId, setSelectedChantierId] = useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedPointage, setCompletedPointage] = useState<{
    chantierName: string;
    totalHours: number;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTaches, setSelectedTaches] = useState<string[]>([]);
  const [tachesSaved, setTachesSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  // Types de tâches disponibles
  const { data: typesTaches } = useQuery({
    queryKey: ["types-taches"],
    queryFn: () => pointageApi.getTypesTaches().then((r) => r.data),
  });

  // Pointage EN_COURS du jour
  const { data: activePointage, isLoading: loadingActive } = useQuery({
    queryKey: ["pointage-today"],
    queryFn: () => pointageApi.getTodayActive().then((r) => r.data),
  });

  // Chantiers affectés (pour le sélecteur)
  const { data: chantiers, isLoading: loadingChantiers } = useQuery({
    queryKey: ["mes-chantiers"],
    queryFn: () => chantierApi.findMyChantiers().then((r) => r.data),
    enabled: !activePointage,
  });

  const startMutation = useMutation({
    mutationFn: (chantierId: string) => pointageApi.start(chantierId),
    onSuccess: () => {
      setErrorMsg(null);
      setSelectedChantierId(null);
      queryClient.invalidateQueries({ queryKey: ["pointage-today"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ?? "Impossible de démarrer le pointage";
      setErrorMsg(msg);
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => pointageApi.stop(id),
    onSuccess: (res) => {
      const p = res.data;
      setShowConfirm(false);
      setCompletedPointage({
        chantierName: p.chantier?.name ?? "Chantier",
        totalHours: p.totalHours ?? 0,
      });
      queryClient.invalidateQueries({ queryKey: ["pointage-today"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setShowConfirm(false);
      const msg =
        err?.response?.data?.message ?? "Impossible de terminer le pointage";
      setErrorMsg(msg);
    },
  });

  const saveTasksMutation = useMutation({
    mutationFn: (taches: string[]) =>
      pointageApi.saveTaches(activePointage!.id, taches),
    onSuccess: () => {
      setTachesSaved(true);
      setTimeout(() => setTachesSaved(false), 2000);
    },
  });

  const saveCommentMutation = useMutation({
    mutationFn: (text: string) =>
      pointageApi.updateComment(activePointage!.id, text),
    onSuccess: () => {
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 2000);
    },
  });

  const toggleTache = (t: string) =>
    setSelectedTaches((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const handleStart = () => {
    if (!selectedChantierId) return;
    setErrorMsg(null);
    startMutation.mutate(selectedChantierId);
  };

  if (loadingActive) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // ── Journée terminée — confirmation de durée (CA5) ───────────────────────
  if (completedPointage) {
    const h = Math.floor(completedPointage.totalHours);
    const m = Math.round((completedPointage.totalHours - h) * 60);
    const durationLabel =
      m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
    return (
      <View style={styles.container}>
        <View style={styles.doneCard}>
          <CheckCircle size={48} color="#16a34a" />
          <Text style={styles.doneTitle}>Journée terminée !</Text>
          <Text style={styles.doneChantier}>
            {completedPointage.chantierName}
          </Text>
          <View style={styles.durationBox}>
            <Text style={styles.durationLabel}>Durée</Text>
            <Text style={styles.durationValue}>{durationLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.newDayButton}
            onPress={() => setCompletedPointage(null)}
          >
            <Text style={styles.newDayText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Récapitulatif avant soumission (US-007) ──────────────────────────────
  if (showConfirm && activePointage) {
    const now = new Date();
    const startTime = new Date(activePointage.startTime);
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedH = elapsedMs / 3_600_000;
    const h = Math.floor(elapsedH);
    const m = Math.round((elapsedH - h) * 60);
    const durationLabel =
      m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
    const since = startTime.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const until = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.container}>
        <View style={styles.recapCard}>
          <AlertCircle size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
          <Text style={styles.recapTitle}>Confirmer la fin de journée</Text>

          <View style={styles.recapRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.recapLabel}>Chantier</Text>
            <Text style={styles.recapValue}>
              {activePointage.chantier?.name ?? "—"}
            </Text>
          </View>

          <View style={styles.recapRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.recapLabel}>Début</Text>
            <Text style={styles.recapValue}>{since}</Text>
          </View>

          <View style={styles.recapRow}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.recapLabel}>Fin</Text>
            <Text style={styles.recapValue}>{until}</Text>
          </View>

          <View style={[styles.recapRow, styles.recapRowLast]}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeLabel}>Durée estimée</Text>
              <Text style={styles.durationBadgeValue}>{durationLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.confirmActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowConfirm(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              stopMutation.isPending && styles.confirmButtonDisabled,
            ]}
            onPress={() => stopMutation.mutate(activePointage.id)}
            disabled={stopMutation.isPending}
          >
            {stopMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Mode journée en cours ─────────────────────────────────────────────────
  if (activePointage) {
    const since = new Date(activePointage.startTime).toLocaleTimeString(
      "fr-FR",
      { hour: "2-digit", minute: "2-digit" },
    );
    return (
      <View style={styles.container}>
        <View style={styles.activeCard}>
          <View style={styles.dot} />
          <Text style={styles.activeLabel}>Journée en cours</Text>
          <Text style={styles.activeSince}>Démarré à {since}</Text>
          {activePointage.chantier && (
            <View style={styles.chantierBadge}>
              <MapPin size={14} color="#2563eb" />
              <Text style={styles.chantierBadgeText}>
                {activePointage.chantier.name}
              </Text>
            </View>
          )}
        </View>

        {/* Checklist des t\u00e2ches (US-009) */}
        <View style={styles.tachesSection}>
          <Text style={styles.tachesSectionTitle}>Activit\u00e9s du jour</Text>
          <View style={styles.tachesGrid}>
            {(typesTaches ?? []).map((t) => {
              const active = selectedTaches.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tacheChip, active && styles.tacheChipActive]}
                  onPress={() => toggleTache(t)}
                >
                  <Text
                    style={[
                      styles.tacheChipText,
                      active && styles.tacheChipTextActive,
                    ]}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedTaches.length > 0 && (
            <TouchableOpacity
              style={[
                styles.saveTachesButton,
                saveTasksMutation.isPending && styles.saveTachesButtonDisabled,
              ]}
              onPress={() => saveTasksMutation.mutate(selectedTaches)}
              disabled={saveTasksMutation.isPending}
            >
              {saveTasksMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveTachesButtonText}>
                  {tachesSaved
                    ? "\u2713 Sauvegard\u00e9"
                    : `Sauvegarder (${selectedTaches.length})`}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Commentaire (US-010) */}
        <View style={styles.commentSection}>
          <Text style={styles.commentSectionTitle}>Commentaire patron</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Informations à transmettre au patron…"
            placeholderTextColor="#9ca3af"
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <View style={styles.commentFooter}>
            <Text style={styles.commentCounter}>{comment.length}/500</Text>
            {comment.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.saveCommentButton,
                  saveCommentMutation.isPending &&
                    styles.saveCommentButtonDisabled,
                ]}
                onPress={() => saveCommentMutation.mutate(comment)}
                disabled={saveCommentMutation.isPending}
              >
                {saveCommentMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveCommentButtonText}>
                    {commentSaved ? "✓ Envoyé" : "Sauvegarder"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.stopButton,
            stopMutation.isPending && styles.stopButtonDisabled,
          ]}
          onPress={() => setShowConfirm(true)}
          disabled={stopMutation.isPending}
        >
          {stopMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Square size={20} color="#fff" />
              <Text style={styles.stopButtonText}>Terminer la journée</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ── Mode sélection chantier + démarrage ───────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choisissez votre chantier</Text>

      {loadingChantiers ? (
        <ActivityIndicator color="#2563eb" style={{ marginTop: 24 }} />
      ) : !chantiers?.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun chantier actif affecté</Text>
        </View>
      ) : (
        <FlatList
          data={chantiers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const selected = selectedChantierId === item.id;
            return (
              <TouchableOpacity
                style={[styles.chantierCard, selected && styles.selectedCard]}
                onPress={() => setSelectedChantierId(selected ? null : item.id)}
              >
                <MapPin size={16} color={selected ? "#2563eb" : "#9ca3af"} />
                <View style={styles.chantierInfo}>
                  <Text
                    style={[
                      styles.chantierName,
                      selected && styles.selectedText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.chantierAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.startButton,
          (!selectedChantierId || startMutation.isPending) &&
            styles.startButtonDisabled,
        ]}
        onPress={handleStart}
        disabled={!selectedChantierId || startMutation.isPending}
      >
        {startMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Play size={20} color="#fff" />
            <Text style={styles.startButtonText}>Commencer la journée</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  // ── Journée en cours ────────────────────────────────────────────────────
  activeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#16a34a",
    marginBottom: 12,
  },
  activeLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  activeSince: { fontSize: 15, color: "#6b7280", marginBottom: 16 },
  chantierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  chantierBadgeText: { fontSize: 13, color: "#2563eb", fontWeight: "600" },
  // ── Sélecteur chantier ──────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  list: { gap: 10, paddingBottom: 16 },
  chantierCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedCard: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  chantierInfo: { flex: 1 },
  chantierName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  selectedText: { color: "#2563eb" },
  chantierAddress: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  emptyText: { fontSize: 15, color: "#6b7280", textAlign: "center" },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  // ── Bouton Commencer ────────────────────────────────────────────────────
  startButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: "auto",
  },
  startButtonDisabled: { backgroundColor: "#93c5fd" },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // ── Bouton Terminer ─────────────────────────────────────────────────────
  stopButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: "auto",
  },
  stopButtonDisabled: { backgroundColor: "#fca5a5" },
  stopButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // ── Récapitulatif de confirmation ────────────────────────────────────────
  recapCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  recapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  recapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  recapRowLast: { borderBottomWidth: 0, paddingTop: 16 },
  recapLabel: { flex: 1, fontSize: 14, color: "#6b7280" },
  recapValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  durationBadge: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  durationBadgeLabel: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  durationBadgeValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#15803d",
    marginTop: 2,
  },
  confirmActions: { flexDirection: "row", gap: 12, marginTop: "auto" },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, color: "#475569", fontWeight: "600" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  confirmButtonDisabled: { backgroundColor: "#fca5a5" },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // ── Confirmation fin de journée ─────────────────────────────────────────
  doneCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  doneTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  doneChantier: { fontSize: 14, color: "#6b7280" },
  durationBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  durationValue: { fontSize: 36, fontWeight: "800", color: "#15803d" },
  newDayButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  newDayText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  // ── Checklist tâches ────────────────────────────────────────────────────
  tachesSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tachesSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tachesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tacheChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tacheChipActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  tacheChipText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  tacheChipTextActive: { color: "#2563eb", fontWeight: "700" },
  saveTachesButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveTachesButtonDisabled: { backgroundColor: "#93c5fd" },
  saveTachesButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  // ── Commentaire ──────────────────────────────────────────────────────────
  commentSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  commentSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  commentInput: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    backgroundColor: "#f9fafb",
  },
  commentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  commentCounter: { fontSize: 12, color: "#9ca3af" },
  saveCommentButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  saveCommentButtonDisabled: { backgroundColor: "#93c5fd" },
  saveCommentButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
