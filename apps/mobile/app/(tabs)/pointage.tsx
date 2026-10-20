import { View, ScrollView, Text } from "react-native";
import { Square, CheckCircle, ClipboardCheck } from "lucide-react-native";
import { usePointage } from "@/src/hooks/usePointage";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { Button } from "@/src/components/ui/Button";
import { ActivePointageCard } from "@/src/components/business/ActivePointageCard";
import { TacheChecklist } from "@/src/components/business/TacheChecklist";
import { ChantierSelector } from "@/src/components/business/ChantierSelector";
import { PointageCommentInput } from "@/src/components/business/PointageCommentInput";

export default function PointageScreen() {
  const {
    selectedChantierId,
    setSelectedChantierId,
    errorMsg,
    successMsg,
    showConfirm,
    showCancelConfirm,
    commentDraft,
    setCommentDraft,
    selectedTaches,
    tachesChantier,
    durations,
    actualMinutes,
    repartitionIsValid,
    updateBoundary,
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
    repartitionMutation,
    autoSubmitting,
    minimumDurationReached,
    handleSubmit,
  } = usePointage();

  if (loadingActive) return <LoadingSpinner />;

  if (activePointage) {
    return (
      <View className="flex-1 bg-stone-100">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivePointageCard pointage={activePointage} errorMsg={errorMsg} />
          <View className="px-4 pt-5 pb-1 flex-row items-center gap-2">
            <ClipboardCheck size={17} color="#57534e" />
            <Text className="text-xs font-bold uppercase tracking-widest text-stone-600">
              Activité du jour
            </Text>
          </View>
          <TacheChecklist
            taches={tachesChantier}
            selectedTaches={selectedTaches}
            onToggle={toggleTache}
          />
          <PointageCommentInput
            value={commentDraft}
            onChange={setCommentDraft}
          />
        </ScrollView>

        <View className="px-4 pt-3 pb-8 bg-white border-t-2 border-stone-200">
          {showConfirm ? (
            <View className="gap-3">
              <Text className="text-base text-gray-900 font-bold text-center">
                Confirmer la fin de journée ?
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Vos activités et votre commentaire seront conservés.
              </Text>
              <View className="flex-row gap-3">
                <Button
                  label="Annuler"
                  variant="ghost"
                  onPress={handleCancelStop}
                  className="flex-1"
                  accessibilityLabel="Annuler"
                />
                <Button
                  label="Terminer"
                  variant="danger"
                  onPress={handleConfirmStop}
                  loading={stopMutation.isPending}
                  className="flex-1"
                  accessibilityLabel="Confirmer fin de journée"
                />
              </View>
            </View>
          ) : showCancelConfirm ? (
            <View className="gap-3">
              <Text className="text-base text-gray-900 font-bold text-center">
                Annuler le pointage ?
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Le pointage, les tâches et le commentaire seront supprimés.
              </Text>
              <View className="flex-row gap-3">
                <Button
                  label="Retour"
                  variant="ghost"
                  onPress={handleCancelCancel}
                  className="flex-1"
                  accessibilityLabel="Retour sans annuler"
                />
                <Button
                  label="Supprimer"
                  variant="danger"
                  onPress={handleConfirmCancel}
                  loading={cancelMutation.isPending}
                  className="flex-1"
                  accessibilityLabel="Confirmer la suppression du pointage"
                />
              </View>
            </View>
          ) : (
            <View className="gap-3">
              <Button
                label="Terminer ma journée"
                variant="danger"
                icon={
                  <Square size={20} color="#fff" style={{ marginRight: 8 }} />
                }
                onPress={handleRequestStop}
                disabled={!minimumDurationReached}
                accessibilityLabel="Terminer la journée"
              />
              <Button
                label="Annuler le pointage"
                variant="ghost"
                onPress={handleRequestCancel}
                accessibilityLabel="Annuler et supprimer le pointage"
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  if (completedPointage) {
    if (autoSubmitting) {
      return <LoadingSpinner />;
    }

    return (
      <View className="flex-1 bg-stone-100">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-brand px-5 pt-7 pb-6 mb-1">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-lg bg-emerald-400 items-center justify-center">
                <CheckCircle size={24} color="#1c1917" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  Journée terminée
                </Text>
                <Text className="text-sm text-stone-300 mt-1">
                  Vérifiez vos informations avant l'envoi.
                </Text>
              </View>
            </View>
          </View>
          <PointageCommentInput
            value={commentDraft}
            onChange={setCommentDraft}
          />
          {selectedTaches.length > 1 ? (
            <TacheChecklist
              taches={tachesChantier}
              selectedTaches={selectedTaches}
              onToggle={toggleTache}
              mode="repartition"
              durations={durations}
              actualMinutes={actualMinutes}
              onBoundaryChange={updateBoundary}
            />
          ) : null}
          {errorMsg ? (
            <Text className="text-sm text-red-600 text-center mb-4">
              {errorMsg}
            </Text>
          ) : null}
          <View className="px-4 pt-2">
            <Button
              label={
                selectedTaches.length === 1
                  ? "Réessayer l'envoi"
                  : "Enregistrer et envoyer"
              }
              onPress={handleSubmit}
              loading={
                submitMutation.isPending || repartitionMutation.isPending
              }
              disabled={!repartitionIsValid}
              accessibilityLabel="Envoyer le pointage pour validation"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-100">
      <ChantierSelector
        chantiers={chantiers}
        loading={loadingChantiers}
        selectedId={selectedChantierId}
        onSelect={setSelectedChantierId}
        onStart={handleStart}
        isPending={startMutation.isPending}
        errorMsg={errorMsg}
      />
      {successMsg ? (
        <View className="absolute bottom-28 left-4 right-4 bg-brand rounded-xl px-5 py-4 flex-row items-center gap-3 border border-primary">
          <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center">
            <CheckCircle size={19} color="#ffffff" />
          </View>
          <Text className="text-white font-semibold text-base flex-1">
            {successMsg}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
