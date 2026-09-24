"use server";

import { redis } from "@/lib/redis";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getNotificationSettings() {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  const settings = await redis.hgetall("settings:notifications");
  
  // Provide defaults for all keys
  const getBool = (key: string, def = true) => settings[key] !== undefined ? settings[key] === "true" : def;

  return {
    globalSms: getBool("globalSms"),
    globalEmail: getBool("globalEmail"),
    
    // Returns
    returns_submitted_sms: getBool("returns_submitted_sms", false),
    returns_submitted_email: getBool("returns_submitted_email", false),
    returns_pending_sms: getBool("returns_pending_sms", false),
    returns_pending_email: getBool("returns_pending_email", false),
    returns_approved_sms: getBool("returns_approved_sms"),
    returns_approved_email: getBool("returns_approved_email"),
    returns_rejected_sms: getBool("returns_rejected_sms"),
    returns_rejected_email: getBool("returns_rejected_email"),
    returns_refunded_sms: getBool("returns_refunded_sms"),
    returns_refunded_email: getBool("returns_refunded_email"),
    
    // Orders
    orders_paid_sms: getBool("orders_paid_sms"),
    orders_paid_email: getBool("orders_paid_email"),
    orders_processing_sms: getBool("orders_processing_sms"),
    orders_processing_email: getBool("orders_processing_email"),
    orders_shipped_sms: getBool("orders_shipped_sms"),
    orders_shipped_email: getBool("orders_shipped_email"),
    orders_delivered_sms: getBool("orders_delivered_sms"),
    orders_delivered_email: getBool("orders_delivered_email"),
    orders_cancelled_sms: getBool("orders_cancelled_sms"),
    orders_cancelled_email: getBool("orders_cancelled_email"),
  };
}

export async function updateNotificationSetting(key: string, value: boolean) {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  await redis.hset("settings:notifications", key, value ? "true" : "false");
  revalidatePath("/admin/settings/notifications");
  return { success: true };
}
