export const formatPrice = (poisha: number): string => {
  return `৳ ${(poisha / 100).toLocaleString("en-BD")}`;
};
