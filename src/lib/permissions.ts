export type UserRole = "USER" | "BLOG_ADMIN" | "ADMIN" | "SUPER_ADMIN";

/**
 * آیا کاربر حداقل دسترسی پنل ادمین را دارد؟ (شامل BLOG_ADMIN هم می‌شود)
 */
export function hasAdminPanelAccess(role?: string | null): boolean {
  if (!role) return false;
  return ["BLOG_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(role);
}

/**
 * آیا کاربر به بخش مدیریت محصولات، سفارشات و دسته‌بندی‌ها دسترسی دارد؟
 */
export function canManageStore(role?: string | null): boolean {
  if (!role) return false;
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

/**
 * آیا کاربر به بخش مدیریت وبلاگ و مقالات دسترسی دارد؟
 */
export function canManageBlog(role?: string | null): boolean {
  if (!role) return false;
  return ["BLOG_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(role);
}

/**
 * آیا کاربر به بخش مدیریت نقش کاربران دسترسی دارد؟ (فقط سوپر ادمین)
 */
export function canManageRoles(role?: string | null): boolean {
  if (!role) return false;
  return role === "SUPER_ADMIN";
}

/**
 * تابع کمکی برای بررسی اینکه آیا کاربر نقش کامل ادمینی دارد (دسترسی به تنظیمات کلی و ...)
 */
export function hasFullAdminAccess(role?: string | null): boolean {
  if (!role) return false;
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}
