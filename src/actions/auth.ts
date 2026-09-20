"use server";

import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || password.length < 6) {
      return { error: "ایمیل و رمز عبور (حداقل ۶ کاراکتر) الزامی است." };
    }

    // Check if user exists
    const existingUser = await db.orm.public.User.where({ email }).first();
    if (existingUser) {
      return { error: "این ایمیل قبلاً ثبت شده است." };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await db.orm.public.User.create({
      email,
      passwordHash,
    });

    // Create JWT session
    await createSession(user.id, user.role, user.name || "کاربر");

  } catch (error) {
    console.error(error);
    return { error: "خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید." };
  }
  
  redirect("/");
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "ایمیل و رمز عبور الزامی است." };
    }

    // Find user
    const user = await db.orm.public.User.where({ email }).first();
    if (!user) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }

    // Create session
    await createSession(user.id, user.role, user.name || "کاربر");

  } catch (error) {
    console.error(error);
    return { error: "خطایی در لاگین رخ داد." };
  }
  
  redirect("/");
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}
