export type UserRole = "USER" | "BLOG_ADMIN" | "ADMIN" | "SUPER_ADMIN" | "SUPPORT";

/**
 * آیا کاربر حداقل دسترسی پنل ادمین را دارد؟ (شامل BLOG_ADMIN هم می‌شود)
 */
export function hasAdminPanelAccess(role?: string | null): boolean {
  if (!role) return false;
  return ["BLOG_ADMIN", "ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(role);
}

/**
 * آیا کاربر به بخش پیام‌های پشتیبانی دسترسی دارد؟
 */
export function canManageSupport(role?: string | null): boolean {
  if (!role) return false;
  return ["SUPPORT", "ADMIN", "SUPER_ADMIN"].includes(role);
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
  return ["BLOG_ADMIN", "ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(role);
}

/**
 * آیا کاربر به بخش مدیریت نقش کاربران دسترسی دارد؟ (ادمین و سوپر ادمین)
 */
export function canManageRoles(role?: string | null): boolean {
  if (!role) return false;
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

/**
 * تابع کمکی برای بررسی اینکه آیا کاربر نقش کامل ادمینی دارد (دسترسی به تنظیمات کلی و ...)
 */
export function hasFullAdminAccess(role?: string | null): boolean {
  if (!role) return false;
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}
