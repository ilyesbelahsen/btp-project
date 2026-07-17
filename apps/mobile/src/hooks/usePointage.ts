import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/constants/query-keys";
import { chantierService } from "@/src/services/chantier.service";
import { pointageService } from "@/src/services/pointage.service";
import type { CompletedPointage } from "@/src/types/pointage.type";

type ApiError = {
  response?: { data?: { message?: string } };
};

export function usePointage() {
  const queryClient = useQueryClient();

  const [selectedChantierId, setSelectedChantierId] = useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedPointage, setCompletedPointage] =
    useState<CompletedPointage | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTaches, setSelectedTaches] = useState<string[]>([]);
  const [tachesSaved, setTachesSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);

  const { data: typesTaches } = useQuery({
    queryKey: queryKeys.typesTaches(),
    queryFn: pointageService.getTypesTaches,
  });

  const { data: activePointage, isLoading: loadingActive } = useQuery({
    queryKey: queryKeys.pointageToday(),
    queryFn: pointageService.getTodayActive,
  });

  const { data: chantiers, isLoading: loadingChantiers } = useQuery({
    queryKey: queryKeys.mesChantiers(),
    queryFn: chantierService.findMyChantiers,
    enabled: !activePointage,
  });

  const startMutation = useMutation({
    mutationFn: pointageService.start,
    onSuccess: () => {
      setErrorMsg(null);
      setSelectedChantierId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
    },
    onError: (err: ApiError) => {
      const msg =
        err?.response?.data?.message ?? "Impossible de démarrer le pointage";
      setErrorMsg(msg);
    },
  });

  const stopMutation = useMutation({
    mutationFn: pointageService.stop,
    onSuccess: (pointage) => {
      setShowConfirm(false);
      setCompletedPointage({
        chantierName: pointage.chantier?.name ?? "Chantier",
        totalHours: pointage.totalHours ?? 0,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointageToday() });
    },
    onError: (err: ApiError) => {
      setShowConfirm(false);
      const msg =
        err?.response?.data?.message ?? "Impossible de terminer le pointage";
      setErrorMsg(msg);
    },
  });

  const saveTasksMutation = useMutation({
    mutationFn: (taches: string[]) => {
      if (!activePointage) return Promise.resolve();
      return pointageService.saveTaches(activePointage.id, taches);
    },
    onSuccess: () => {
      setTachesSaved(true);
      setTimeout(() => setTachesSaved(false), 2000);
    },
  });

  const saveCommentMutation = useMutation({
    mutationFn: (text: string) => {
      if (!activePointage) return Promise.resolve();
      return pointageService.updateComment(activePointage.id, text);
    },
    onSuccess: () => {
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 2000);
    },
  });

  const toggleTache = (tache: string) =>
    setSelectedTaches((prev) =>
      prev.includes(tache) ? prev.filter((x) => x !== tache) : [...prev, tache],
    );

  const handleStart = () => {
    if (!selectedChantierId) return;
    setErrorMsg(null);
    startMutation.mutate(selectedChantierId);
  };

  const handleStopConfirm = () => {
    if (!activePointage) return;
    stopMutation.mutate(activePointage.id);
  };

  const handleDismissCompleted = () => setCompletedPointage(null);

  return {
    selectedChantierId,
    setSelectedChantierId,
    errorMsg,
    completedPointage,
    showConfirm,
    setShowConfirm,
    selectedTaches,
    tachesSaved,
    comment,
    setComment,
    commentSaved,
    typesTaches,
    activePointage,
    chantiers,
    loadingActive,
    loadingChantiers,
    toggleTache,
    handleStart,
    handleStopConfirm,
    handleDismissCompleted,
    startMutation,
    stopMutation,
    saveTasksMutation,
    saveCommentMutation,
  };
}
