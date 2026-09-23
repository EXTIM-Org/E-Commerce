"use server";

import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { render } from "@react-email/render";
import { notificationQueue } from "@/jobs/queues";
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail";
import React from "react";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function registerUser(prevState: unknown, formData: FormData) {
  try {
    const ip = await getClientIp();
    const rate = await rateLimit(ip, "REGISTER", 3, 60 * 60 * 1000); // 3 per hour
    if (!rate.success) return { error: "تعداد درخواست‌های ثبت‌نام بیش از حد مجاز است. لطفاً ۱ ساعت دیگر تلاش کنید." };

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
    const ip = await getClientIp();
    const rate = await rateLimit(ip, "LOGIN", 5, 5 * 60 * 1000); // 5 per 5 minutes
    if (!rate.success) return { error: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۵ دقیقه دیگر تلاش کنید." };

    const identifier = formData.get("email") as string; // The frontend passes identifier as "email"
    const password = formData.get("password") as string;

    if (!identifier || !password) {
      return { error: "ایمیل/شماره موبایل و رمز عبور الزامی است." };
    }

    const isPhone = /^09[0-9]{9}$/.test(identifier);

    // Find user
    const user = isPhone
      ? await db.orm.public.User.where({ phoneNumber: identifier }).first()
      : await db.orm.public.User.where({ email: identifier.toLowerCase() }).first();

    if (!user || !user.passwordHash) {
      return { error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است." };
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
    const ip = await getClientIp();
    const rate = await rateLimit(ip, "RESET_PASSWORD", 3, 15 * 60 * 1000); // 3 per 15 minutes
    if (!rate.success) return { error: "درخواست‌های بازیابی بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید." };

    const email = formData.get("email") as string;
    
    if (!email) {
      return { error: "لطفا ایمیل خود را وارد کنید." };
    }

    const user = await db.orm.public.User.where({ email: email.toLowerCase() }).first();
    
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not defined in environment variables");
    }
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    
    const html = await render(
      React.createElement(ResetPasswordEmail, {
        customerName: user.name || "کاربر",
        resetLink: resetUrl,
      })
    );

    if (user.email) {
      await notificationQueue.add("send-email", {
        type: "email",
        payload: {
          to: user.email,
          subject: "بازیابی رمز عبور",
          html,
        }
      });
    }

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

export async function sendOtp(prevState: unknown, formData: FormData) {
  try {
    const ip = await getClientIp();
    const rate = await rateLimit(ip, "SEND_OTP", 3, 10 * 60 * 1000); // 3 per 10 minutes
    if (!rate.success) return { error: "درخواست‌های ارسال پیامک بیش از حد مجاز است. لطفاً ۱۰ دقیقه دیگر تلاش کنید." };

    const phoneNumber = formData.get("phoneNumber") as string;
    
    if (!phoneNumber || !/^09[0-9]{9}$/.test(phoneNumber)) {
      return { error: "شماره موبایل نامعتبر است. مثال: 09123456789" };
    }

    // Generate 5-digit OTP
    const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Set expiry to 2 minutes from now
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 2);

    // Find or create user
    let user = await db.orm.public.User.where({ phoneNumber }).first();
    
    if (user) {
      // Update existing user's OTP
      await db.orm.public.User.where({ id: user.id }).update({
        otpCode,
        otpExpiry: expiry.toISOString(),
      });
    } else {
      // Create new user (they won't have email/password initially)
      user = await db.orm.public.User.create({
        phoneNumber,
        otpCode,
        otpExpiry: expiry.toISOString(),
      });
    }

    // Send SMS
    await notificationQueue.add("send-sms", {
      type: "sms",
      payload: {
        to: phoneNumber,
        text: `کد تایید شما در اکستیم: ${otpCode}\nاین کد تا ۲ دقیقه معتبر است.`,
      }
    });

    return { success: true, message: "کد تایید با موفقیت ارسال شد." };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { error: "خطایی در ارسال پیامک رخ داد." };
  }
}

export async function verifyOtp(prevState: unknown, formData: FormData) {
  try {
    const phoneNumber = formData.get("phoneNumber") as string;
    const code = formData.get("code") as string;

    if (!phoneNumber || !code || code.length !== 5) {
      return { error: "اطلاعات وارد شده نامعتبر است." };
    }

    const user = await db.orm.public.User.where({ phoneNumber }).first();

    if (!user) {
      return { error: "کاربری با این شماره یافت نشد." };
    }

    if (user.otpCode !== code) {
      return { error: "کد تایید اشتباه است." };
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return { error: "کد تایید منقضی شده است. لطفا مجددا درخواست دهید." };
    }

    // Clear OTP and set phone as verified
    await db.orm.public.User.where({ id: user.id }).update({
      otpCode: null,
      otpExpiry: null,
      phoneVerified: true,
    });

    // Create session
    await createSession(user.id, user.role, user.name || "کاربر", user.image || undefined);
    
    if (!user.passwordHash) {
      return { success: true, needsPassword: true };
    }

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { error: "خطایی در بررسی کد رخ داد." };
  }
  
  redirect("/");
}

export async function setPhonePassword(prevState: unknown, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "نشست نامعتبر است." };
    }

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) return { error: "رمز عبور جدید حداقل باید ۶ کاراکتر باشد." };
    if (password !== confirmPassword) return { error: "رمز عبور با تکرار آن مطابقت ندارد." };

    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.orm.public.User.where({ id: session.userId as string }).update({
      passwordHash,
    });

  } catch (error) {
    console.error("Error setting phone password:", error);
    return { error: "خطایی رخ داد. لطفا دوباره تلاش کنید." };
  }

  redirect("/");
}

export async function checkIdentifier(identifier: string) {
  const isPhone = /^09[0-9]{9}$/.test(identifier);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  
  if (!isPhone && !isEmail) {
    return { error: "لطفا یک ایمیل یا شماره موبایل معتبر وارد کنید." };
  }

  if (isPhone) {
    const user = await db.orm.public.User.where({ phoneNumber: identifier }).first();
    return { type: "PHONE", exists: !!user, hasPassword: !!user?.passwordHash, formatted: identifier };
  } else {
    const user = await db.orm.public.User.where({ email: identifier }).first();
    return { type: "EMAIL", exists: !!user, formatted: identifier.toLowerCase() };
  }
}
