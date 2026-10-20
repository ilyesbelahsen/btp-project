import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { queryKeys } from "@/src/constants/query-keys";
import { chantierService } from "@/src/services/chantier.service";
import { pointageService } from "@/src/services/pointage.service";
import { formatDurationLabel } from "@/src/utils/date.utils";
import type { Pointage } from "@/src/types/pointage.type";

type ApiError = {
  response?: { status?: number; data?: { message?: string } };
};

const MIN_POINTAGE_MINUTES = 3;

function distributeEvenly(taskIds: string[], totalMinutes: number) {
  if (taskIds.length === 0) return {};

  const baseMinutes = Math.floor(totalMinutes / taskIds.length);
  const remainder = totalMinutes % taskIds.length;

  return Object.fromEntries(
    taskIds.map((taskId, index) => [
      taskId,
      baseMinutes + (index < remainder ? 1 : 0),
    ]),
  );
}

export function usePointage() {
  const queryClient = useQueryClient();

  const [selectedChantierId, setSelectedChantierId] = useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTaches, setSelectedTaches] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [completedPointage, setCompletedPointage] = useState<Pointage | null>(
    null,
  );
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [minimumDurationReached, setMinimumDurationReached] = useState(false);

  const {
    data: activePointage,
    isLoading: loadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: queryKeys.pointageToday(),
    queryFn: pointageService.getTodayActive,
  });

  const {
    data: chantiers,
    isLoading: loadingChantiers,
    refetch: refetchChantiers,
  } = useQuery({
    queryKey: queryKeys.mesChantiers(),
    queryFn: chantierService.findMyChantiers,
    enabled: !activePointage,
  });

  const chantierId =
    activePointage?.chantierId ?? completedPointage?.chantierId;
  const { data: tachesChantier } = useQuery({
    queryKey: queryKeys.tachesChantier(chantierId ?? ""),
    queryFn: () => chantierService.findTaches(chantierId!),
    enabled: Boolean(chantierId),
  });

  useEffect(() => {
    if (activePointage) {
      setSelectedTaches(activePointage.taches ?? []);
      setCommentDraft(activePointage.comment ?? "");
    }
  }, [activePointage?.id]);

  useEffect(() => {
    if (!activePointage) {
      setMinimumDurationReached(false);
      return;
    }

    const updateMinimumDuration = () => {
      const elapsedMinutes =
        (Date.now() - new Date(activePointage.startTime).getTime()) / 60_000;
      setMinimumDurationReached(elapsedMinutes >= MIN_POINTAGE_MINUTES);
    };

    updateMinimumDuration();
    const timer = setInterval(updateMinimumDuration, 1_000);
    return () => clearInterval(timer);
  }, [activePointage?.startTime]);

  useFocusEffect(
    useCallback(() => {
      refetchActive();
      refetchChantiers();
    }, [refetchActive, refetchChantiers]),
  );

  const startMutation = useMutation({
    mutationFn: pointageService.start,
    onSuccess: () => {
      setErrorMsg(null);
      setSelectedChantierId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mesChantiers() });
      queryClient.invalidateQueries({ queryKey: ["historique"] });
      queryClient.invalidateQueries({ queryKey: ["mes-stats"] });
    },
    onError: (err: ApiError) => {
      const msg =
        err?.response?.data?.message ?? "Impossible de démarrer le pointage";
      setErrorMsg(msg);
      // Resync si le serveur connaît un pointage actif que le client ignorait
      if (err?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
      }
    },
  });

  const stopMutation = useMutation({
    mutationFn: pointageService.stop,
    onSuccess: (pointage) => {
      setShowConfirm(false);
      setSuccessMsg(
        `Journée terminée · ${formatDurationLabel(pointage.totalHours ?? 0)}`,
      );
      const totalMinutes =
        pointage.totalMinutes ?? Math.round((pointage.totalHours ?? 0) * 60);
      setDurations(distributeEvenly(selectedTaches, totalMinutes));
      setCompletedPointage({ ...pointage, comment: commentDraft });
      if (selectedTaches.length === 1 && totalMinutes >= MIN_POINTAGE_MINUTES) {
        setAutoSubmitting(true);
        repartitionMutation.mutate(
          {
            pointageId: pointage.id,
            repartitions: [
              {
                tacheId: selectedTaches[0],
                minutes: totalMinutes,
              },
            ],
          },
          {
            onSuccess: () =>
              submitMutation.mutate({
                pointageId: pointage.id,
                comment: commentDraft,
              }),
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mesChantiers() });
      queryClient.invalidateQueries({ queryKey: ["historique"] });
      queryClient.invalidateQueries({ queryKey: ["mes-stats"] });
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: ApiError) => {
      setShowConfirm(false);
      const msg =
        err?.response?.data?.message ?? "Impossible de terminer le pointage";
      setErrorMsg(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: pointageService.cancel,
    onSuccess: () => {
      setShowCancelConfirm(false);
      setSelectedTaches([]);
      setErrorMsg(null);
      setSuccessMsg("Pointage annulé");
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mesChantiers() });
      queryClient.invalidateQueries({ queryKey: ["historique"] });
      queryClient.invalidateQueries({ queryKey: ["mes-stats"] });
    },
    onError: (err: ApiError) => {
      setErrorMsg(
        err?.response?.data?.message ?? "Impossible d annuler le pointage",
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({
      pointageId,
      comment,
    }: {
      pointageId: string;
      comment: string;
    }) => pointageService.submit(pointageId, comment),
    onSuccess: () => {
      setCompletedPointage(null);
      setAutoSubmitting(false);
      setSuccessMsg("Pointage envoyé pour validation");
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mesChantiers() });
      queryClient.invalidateQueries({ queryKey: ["historique"] });
    },
    onError: (err: ApiError) => {
      setErrorMsg(
        err?.response?.data?.message ?? "Impossible d envoyer le pointage",
      );
      setAutoSubmitting(false);
    },
  });

  const toggleTache = (tache: string) => {
    const newTaches = selectedTaches.includes(tache)
      ? selectedTaches.filter((x) => x !== tache)
      : [...selectedTaches, tache];
    setSelectedTaches(newTaches);
    if (activePointage) {
      pointageService.saveTaches(activePointage.id, newTaches).catch(() => {});
    }
  };

  const handleStart = () => {
    if (!selectedChantierId) return;
    setErrorMsg(null);
    startMutation.mutate(selectedChantierId);
  };

  const handleRequestStop = () => {
    if (!minimumDurationReached) {
      setErrorMsg(
        `Le pointage doit durer au moins ${MIN_POINTAGE_MINUTES} minutes`,
      );
      return;
    }
    if (selectedTaches.length === 0) {
      setErrorMsg("Sélectionnez au moins une tâche avant de terminer");
      return;
    }
    setErrorMsg(null);
    setShowConfirm(true);
  };
  const handleCancelStop = () => setShowConfirm(false);
  const handleConfirmStop = () => {
    if (activePointage) stopMutation.mutate(activePointage.id);
  };
  const handleRequestCancel = () => {
    setErrorMsg(null);
    setShowCancelConfirm(true);
  };
  const handleCancelCancel = () => setShowCancelConfirm(false);
  const handleConfirmCancel = () => {
    if (activePointage) cancelMutation.mutate(activePointage.id);
  };
  const updateBoundary = (
    leftTaskId: string,
    rightTaskId: string,
    leftMinutes: number,
  ) => {
    setDurations((current) => {
      const pairTotal =
        (current[leftTaskId] ?? 0) + (current[rightTaskId] ?? 0);
      const clampedLeft = Math.max(0, Math.min(pairTotal, leftMinutes));

      return {
        ...current,
        [leftTaskId]: clampedLeft,
        [rightTaskId]: pairTotal - clampedLeft,
      };
    });
  };

  const actualMinutes =
    completedPointage?.totalMinutes ??
    Math.round((completedPointage?.totalHours ?? 0) * 60);
  const repartitionEntries = (tachesChantier ?? [])
    .filter((tache) => selectedTaches.includes(tache.id))
    .map((tache) => ({
      tacheId: tache.id,
      minutes: durations[tache.id] ?? 0,
    }));
  const repartitionTotalMinutes = repartitionEntries.reduce(
    (total, entry) => total + entry.minutes,
    0,
  );
  const repartitionIsValid =
    actualMinutes >= MIN_POINTAGE_MINUTES &&
    selectedTaches.length > 0 &&
    repartitionEntries.length === selectedTaches.length &&
    repartitionTotalMinutes === actualMinutes;

  const repartitionMutation = useMutation({
    mutationFn: ({
      pointageId,
      repartitions,
    }: {
      pointageId: string;
      repartitions: { tacheId: string; minutes: number }[];
    }) => pointageService.saveRepartition(pointageId, repartitions),
    onError: (err: ApiError) => {
      setAutoSubmitting(false);
      setErrorMsg(
        err?.response?.data?.message ??
          "Impossible d enregistrer la répartition",
      );
    },
  });

  return {
    selectedChantierId,
    setSelectedChantierId,
    errorMsg,
    successMsg,
    showConfirm,
    showCancelConfirm,
    selectedTaches,
    commentDraft,
    setCommentDraft,
    durations,
    actualMinutes,
    repartitionIsValid,
    updateBoundary,
    repartitionMutation,
    autoSubmitting,
    minimumDurationReached,
    tachesChantier,
    activePointage,
    completedPointage,
    chantiers,
    loadingActive,
    loadingChantiers,
    toggleTache,
    handleStart,
    handleRequestStop,
    handleCancelStop,
    handleConfirmStop,
    handleRequestCancel,
    handleCancelCancel,
    handleConfirmCancel,
    startMutation,
    stopMutation,
    cancelMutation,
    submitMutation,
    handleSubmit: () => {
      if (actualMinutes < MIN_POINTAGE_MINUTES) {
        setErrorMsg(
          `Le pointage doit durer au moins ${MIN_POINTAGE_MINUTES} minutes`,
        );
        return;
      }
      if (!completedPointage || !repartitionIsValid) {
        setErrorMsg("La répartition doit correspondre à la durée pointée");
        return;
      }
      const minutes = actualMinutes;
      repartitionMutation.mutate(
        {
          pointageId: completedPointage.id,
          repartitions:
            selectedTaches.length === 1
              ? [{ tacheId: selectedTaches[0], minutes }]
              : repartitionEntries,
        },
        {
          onSuccess: () =>
            submitMutation.mutate({
              pointageId: completedPointage.id,
              comment: commentDraft,
            }),
        },
      );
    },
  };
}
