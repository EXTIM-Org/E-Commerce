export function getEffectivePrice(
  basePrice: number,
  baseDiscountPercent: number = 0,
  flashSale?: { isActive: boolean; startTime: string | Date; endTime: string | Date; discountPercent: number } | null
): {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
} {
  let hasDiscount = false;
  let finalPrice = basePrice;
  let activeDiscountPercent = 0;

  if (baseDiscountPercent > 0) {
    hasDiscount = true;
    activeDiscountPercent = baseDiscountPercent;
    finalPrice = basePrice - (basePrice * baseDiscountPercent) / 100;
  }

  if (flashSale && flashSale.isActive) {
    const now = new Date();
    const start = new Date(flashSale.startTime);
    const end = new Date(flashSale.endTime);
    if (now >= start && now <= end) {
      hasDiscount = true;
      activeDiscountPercent = Math.max(activeDiscountPercent, flashSale.discountPercent);
      finalPrice = basePrice - (basePrice * activeDiscountPercent) / 100;
    }
  }

  return {
    originalPrice: basePrice,
    finalPrice: Math.round(finalPrice),
    hasDiscount,
    discountPercent: activeDiscountPercent,
  };
}
