export type RepartitionBase = {
  tacheId: string;
  minutes: number;
};

export type RepartitionDetail = RepartitionBase & {
  bonusMinutes: number;
  totalMinutes: number;
};

export function calculateRepartition(
  baseRepartitions: RepartitionBase[],
  actualMinutes: number,
): {
  roundedMinutes: number;
  remainingMinutes: number;
  details: RepartitionDetail[];
} {
  const roundedMinutes = Math.floor(actualMinutes / 30) * 30;
  const remainingMinutes = actualMinutes - roundedMinutes;
  const baseTotal = baseRepartitions.reduce(
    (total, repartition) => total + repartition.minutes,
    0,
  );

  if (remainingMinutes === 0) {
    return {
      roundedMinutes,
      remainingMinutes,
      details: baseRepartitions.map((repartition) => ({
        ...repartition,
        bonusMinutes: 0,
        totalMinutes: repartition.minutes,
      })),
    };
  }

  const weightedDetails = baseRepartitions.map((repartition) => {
    const exactBonus =
      baseTotal > 0
        ? (remainingMinutes * repartition.minutes) / baseTotal
        : remainingMinutes / baseRepartitions.length;
    const bonusMinutes = Math.floor(exactBonus);

    return {
      ...repartition,
      exactBonus,
      bonusMinutes,
      totalMinutes: repartition.minutes + bonusMinutes,
    };
  });
  let unallocatedMinutes =
    remainingMinutes -
    weightedDetails.reduce(
      (total, repartition) => total + repartition.bonusMinutes,
      0,
    );

  const rankedIndexes = weightedDetails
    .map((repartition, index) => ({
      index,
      fraction: repartition.exactBonus - repartition.bonusMinutes,
    }))
    .sort((left, right) => right.fraction - left.fraction);

  for (const { index } of rankedIndexes) {
    if (unallocatedMinutes <= 0) break;
    weightedDetails[index].bonusMinutes += 1;
    weightedDetails[index].totalMinutes += 1;
    unallocatedMinutes -= 1;
  }

  return {
    roundedMinutes,
    remainingMinutes,
    details: weightedDetails.map(
      ({ exactBonus: _exactBonus, ...detail }) => detail,
    ),
  };
}
