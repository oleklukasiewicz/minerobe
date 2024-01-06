export const normalizeNumber = (value: number): string => {
  //add prefix k,b,m or not
  let newValue = value;
  let suffix = "";
  if (value >= 1000) {
    newValue = value / 1000;
    suffix = "k";
  }
  if (value >= 1000000) {
    newValue = value / 1000000;
    suffix = "m";
  }
  if (value >= 1000000000) {
    newValue = value / 1000000000;
    suffix = "b";
  }
  return newValue + suffix;
};
