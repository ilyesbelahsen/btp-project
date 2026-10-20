import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { queryKeys } from "@/src/constants/query-keys";
import { pointageService } from "@/src/services/pointage.service";
import { currentMois, shiftMois } from "@/src/utils/date.utils";

const HISTORIQUE_LIMIT = 10;

export function useHistorique() {
  const [page, setPage] = useState(1);
  const [moisFilter, setMoisFilter] = useState(currentMois());

  const handleSetMois = (mois: string) => {
    setMoisFilter(mois);
    setPage(1);
  };

  const handlePreviousMois = () => handleSetMois(shiftMois(moisFilter, -1));
  const handleNextMois = () => handleSetMois(shiftMois(moisFilter, 1));

  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: queryKeys.mesStats(moisFilter),
    queryFn: () => pointageService.getMesStats(moisFilter),
  });

  const {
    data: historiquePage,
    isLoading,
    isFetching,
    refetch: refetchHistorique,
  } = useQuery({
    queryKey: queryKeys.historique(page, moisFilter),
    queryFn: () =>
      pointageService.getHistorique({
        page,
        limit: HISTORIQUE_LIMIT,
        mois: moisFilter,
      }),
  });

  useFocusEffect(
    useCallback(() => {
      refetchStats();
      refetchHistorique();
    }, [refetchStats, refetchHistorique]),
  );

  const totalPages = historiquePage?.totalPages ?? 1;

  const handlePreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return {
    page,
    moisFilter,
    stats,
    loadingStats,
    historiquePage,
    isLoading,
    isFetching,
    totalPages,
    handlePreviousMois,
    handleNextMois,
    handlePreviousPage,
    handleNextPage,
  };
}
