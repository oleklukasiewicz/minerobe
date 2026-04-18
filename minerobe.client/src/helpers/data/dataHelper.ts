export const normalizeNumber = (value: number): string => {
  if (value >= 1000000000) return `${value / 1000000000}b`;
  if (value >= 1000000) return `${value / 1000000}m`;
  if (value >= 1000) return `${value / 1000}k`;
  return `${value}`;
};
export const IsEmptyGuid = (guid: string): boolean => {
  return guid === "00000000-0000-0000-0000-000000000000";
};
