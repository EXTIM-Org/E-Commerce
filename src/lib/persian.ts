export function e2p(str: string | number): string {
  if (str === null || str === undefined) return '';
  const s = str.toString();
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return s.replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

export function p2e(str: string | number): string {
  if (str === null || str === undefined) return '';
  const s = str.toString();
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return s
    .replace(/[۰-۹]/g, (x) => farsiDigits.indexOf(x).toString())
    .replace(/[٠-٩]/g, (x) => arabicDigits.indexOf(x).toString());
}
