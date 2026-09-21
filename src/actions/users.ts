"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { canManageRoles } from "@/lib/permissions";
import { UserRole } from "@/lib/permissions";

export async function getUsers() {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    throw new Error("Unauthorized");
  }

  return await db.orm.public.User.orderBy(u => u.createdAt.desc()).all();
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    if (newRole === "SUPER_ADMIN") {
      // Check if there is already a super admin, and if so, prevent adding another
      const existingSuperAdmin = await db.orm.public.User.where({ role: "SUPER_ADMIN" }).first();
      // If there's an existing SUPER_ADMIN and it's not the current user passing the torch to themselves?
      // Actually, if a SUPER_ADMIN already exists, and we are setting someone else to SUPER_ADMIN, we should probably throw an error unless we want multiple.
      // But the user requested: "طبیعتا سیستم فقط میتونه یه دونه سوپر ادمین داشته باشه"
      if (existingSuperAdmin && existingSuperAdmin.id !== userId) {
        return { error: "سیستم فقط می‌تواند یک سوپر ادمین داشته باشد." };
      }
    }

    await db.orm.public.User.where({ id: userId }).update({
      role: newRole,
    });
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "خطایی رخ داد" };
  }
}
