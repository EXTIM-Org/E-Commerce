"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { canManageSupport } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(formData: FormData) {
  try {
    const session = await getSession();
    const userId = session?.userId as string | undefined;

    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !contact || !subject || !message) {
      return { success: false, error: "تمامی فیلدها الزامی هستند." };
    }

    await db.orm.public.ContactMessage.create({
      name,
      contact,
      subject,
      message,
      userId: userId || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit contact message:", error);
    return { success: false, error: "خطایی در ثبت پیام رخ داد." };
  }
}

export async function markMessageAsRead(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageSupport(session.role as string)) {
      throw new Error("Unauthorized");
    }

    await db.orm.public.ContactMessage.where({ id }).update({ isRead: true });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return { success: false };
  }
}

export async function deleteMessage(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    await db.orm.public.ContactMessage.where({ id }).delete();

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false };
  }
}
