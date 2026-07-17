import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useHistorique } from '@/src/hooks/useHistorique';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { MonthSelector } from '@/src/components/business/MonthSelector';
import { HistoriqueStats } from '@/src/components/business/HistoriqueStats';
import { PointageHistoriqueItem } from '@/src/components/business/PointageHistoriqueItem';

export default function HistoriqueScreen() {
  const {
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
  } = useHistorique();

  if (isLoading) return <LoadingSpinner />;

  const pointages = historiquePage?.data ?? [];

  return (
    <View className="flex-1 bg-gray-50">
      <MonthSelector
        mois={moisFilter}
        onPrevious={handlePreviousMois}
        onNext={handleNextMois}
      />

      <HistoriqueStats stats={stats} isLoading={loadingStats} />

      {pointages.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-base">
            Aucun pointage enregistré
          </Text>
        </View>
      ) : (
        <FlatList
          data={pointages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
          renderItem={({ item }) => <PointageHistoriqueItem pointage={item} />}
        />
      )}

      {totalPages > 1 ? (
        <View className="flex-row justify-between items-center px-6 py-3 bg-white border-t border-gray-100">
          <TouchableOpacity
            className="p-2 disabled:opacity-40"
            onPress={handlePreviousPage}
            disabled={page === 1 || isFetching}
            accessibilityRole="button"
            accessibilityLabel="Page précédente"
          >
            <ChevronLeft size={20} color={page === 1 ? '#d1d5db' : '#374151'} />
          </TouchableOpacity>

          <Text className="text-sm text-gray-600">
            {page} / {totalPages}
          </Text>

          <TouchableOpacity
            className="p-2 disabled:opacity-40"
            onPress={handleNextPage}
            disabled={page === totalPages || isFetching}
            accessibilityRole="button"
            accessibilityLabel="Page suivante"
          >
            <ChevronRight
              size={20}
              color={page === totalPages ? '#d1d5db' : '#374151'}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
