import { View } from 'react-native';
import { usePointage } from '@/src/hooks/usePointage';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { JourneeTermineeCard } from '@/src/components/business/JourneeTermineeCard';
import { PointageConfirmation } from '@/src/components/business/PointageConfirmation';
import { ActivePointageCard } from '@/src/components/business/ActivePointageCard';
import { TacheChecklist } from '@/src/components/business/TacheChecklist';
import { CommentInput } from '@/src/components/business/CommentInput';
import { ChantierSelector } from '@/src/components/business/ChantierSelector';

export default function PointageScreen() {
  const {
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
  } = usePointage();

  if (loadingActive) return <LoadingSpinner />;

  if (completedPointage) {
    return (
      <JourneeTermineeCard
        completedPointage={completedPointage}
        onDismiss={handleDismissCompleted}
      />
    );
  }

  if (showConfirm && activePointage) {
    return (
      <PointageConfirmation
        pointage={activePointage}
        onConfirm={handleStopConfirm}
        onCancel={() => setShowConfirm(false)}
        isStopping={stopMutation.isPending}
      />
    );
  }

  if (activePointage) {
    return (
      <View className="flex-1 bg-gray-50">
        <ActivePointageCard
          pointage={activePointage}
          onStopRequest={() => setShowConfirm(true)}
          isStopping={stopMutation.isPending}
          errorMsg={errorMsg}
        />
        <TacheChecklist
          typesTaches={typesTaches}
          selectedTaches={selectedTaches}
          onToggle={toggleTache}
          onSave={() => saveTasksMutation.mutate(selectedTaches)}
          isSaving={saveTasksMutation.isPending}
          isSaved={tachesSaved}
        />
        <CommentInput
          value={comment}
          onChange={setComment}
          onSave={() => saveCommentMutation.mutate(comment)}
          isSaving={saveCommentMutation.isPending}
          isSaved={commentSaved}
        />
      </View>
    );
  }

  return (
    <ChantierSelector
      chantiers={chantiers}
      loading={loadingChantiers}
      selectedId={selectedChantierId}
      onSelect={setSelectedChantierId}
      onStart={handleStart}
      isPending={startMutation.isPending}
      errorMsg={errorMsg}
    />
  );
}
