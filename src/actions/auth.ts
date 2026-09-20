"use server";

import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail";
import React from "react";

export async function registerUser(prevState: unknown, formData: FormData) {
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
    await createSession(user.id, user.role, user.name || "کاربر", user.image || undefined);

  } catch (error) {
    console.error(error);
    return { error: "خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید." };
  }
  
  redirect("/");
}

export async function loginUser(prevState: unknown, formData: FormData) {
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
    await createSession(user.id, user.role, user.name || "کاربر", user.image || undefined);

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

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    
    if (!email) {
      return { error: "لطفا ایمیل خود را وارد کنید." };
    }

    const user = await db.orm.public.User.where({ email }).first();
    
    if (!user) {
      // Return success even if user doesn't exist for security reasons (don't leak emails)
      return { success: true };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    // Set expiry to 1 hour from now
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    // Save to DB
    await db.orm.public.User.where({ id: user.id }).update({
      resetToken: hashedToken,
      resetTokenExpiry: expiry.toISOString(),
    });

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    
    const html = await render(
      React.createElement(ResetPasswordEmail, {
        customerName: user.name || "کاربر",
        resetLink: resetUrl,
      })
    );

    await sendEmail({
      to: user.email,
      subject: "بازیابی رمز عبور",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { error: "خطایی رخ داد. لطفا دوباره تلاش کنید." };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token) return { error: "توکن نامعتبر است." };
    if (!password || password.length < 6) return { error: "رمز عبور جدید حداقل باید ۶ کاراکتر باشد." };
    if (password !== confirmPassword) return { error: "رمز عبور با تکرار آن مطابقت ندارد." };

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by valid token
    const user = await db.orm.public.User
      .where((u) => u.resetToken.eq(hashedToken))
      .where((u) => u.resetTokenExpiry.gte(new Date().toISOString()))
      .first();

    if (!user) {
      return { error: "لینک بازیابی نامعتبر یا منقضی شده است." };
    }

    // Update password and clear token
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.orm.public.User.where({ id: user.id }).update({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "خطایی رخ داد. لطفا دوباره تلاش کنید." };
  }
}
