export function getEffectivePrice(
  currentPrice: number,
  flashSale?: { isActive: boolean; startTime: string | Date; endTime: string | Date; discountPercent: number } | null
): {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
} {
  let hasDiscount = false;
  let finalPrice = currentPrice;
  let discountPercent = 0;

  if (flashSale && flashSale.isActive) {
    const now = new Date();
    const start = new Date(flashSale.startTime);
    const end = new Date(flashSale.endTime);
    if (now >= start && now <= end) {
      hasDiscount = true;
      discountPercent = flashSale.discountPercent;
      finalPrice = currentPrice - (currentPrice * discountPercent) / 100;
    }
  }

  return {
    originalPrice: currentPrice,
    finalPrice: Math.round(finalPrice),
    hasDiscount,
    discountPercent,
  };
}
