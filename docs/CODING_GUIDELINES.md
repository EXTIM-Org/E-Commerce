# استانداردهای کدنویسی (Coding Guidelines)

رعایت این اصول برای حفظ تمیزی کد (Clean Code) و توسعه تیمی الزامی است.

## 1. قواعد نام‌گذاری (Naming Conventions)
- **متغیرها و توابع:** `camelCase`
- **کامپوننت‌های React و کلاس‌ها:** `PascalCase` (مانند `ProductCard.tsx`)
- **فایل‌ها:** فایل‌های کامپوننت به صورت PascalCase و سایر فایل‌ها `camelCase` یا `kebab-case`.
- **ثوابت (Constants):** `UPPER_SNAKE_CASE`

## 2. ساختار پوشه‌ها در فرانت‌اند
- `src/components`: کامپوننت‌های قابل استفاده مجدد (UI، Layouts).
- `src/app`: مسیرها (Routes) و صفحات اصلی در Next.js.
- `src/lib` یا `src/utils`: توابع کمکی.
- `src/store`: مدیریت وضعیت (Zustand).
- `src/types`: اینترفیس‌ها و تایپ‌های TypeScript.

## 3. اصول Clean Code
- **توابع کوچک (Small Functions):** هر تابع فقط باید یک کار را انجام دهد.
- **بدون کد تکراری (DRY):** منطق مشترک را به توابع کمکی یا کامپوننت‌ها منتقل کنید.
- **تایپینگ قوی (Strong Typing):** استفاده از `any` در TypeScript ممنوع است مگر در مواقع اجتناب‌ناپذیر با کامنت توضیح.

## 4. امنیت و اعتبارسنجی (Security & Validation)
- همیشه داده‌های ورودی کاربر را در سمت سرور (در Server Actions و Route Handlers) اعتبارسنجی (Validate) کنید (پیشنهاد می‌شود از Zod استفاده شود).
- هیچ‌گاه کلیدهای محرمانه و API Keyها را هاردکد نکنید؛ حتماً از `.env` استفاده کنید و مطمئن شوید در `.gitignore` قرار دارد.
