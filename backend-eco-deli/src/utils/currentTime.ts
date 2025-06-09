export function getCurrentTargetYear(transitionThreshold: number = 7): number {
  const now = new Date();
  const lastDayOfYear = 31;

  if (now.getMonth() === 11 && now.getDate() >= (lastDayOfYear - transitionThreshold + 1)) {
    return now.getFullYear() + 1;
  }

  return now.getFullYear();
}

export function getCurrentMonth(): number {
  const now = new Date();
  return now.getMonth() + 1;
}
