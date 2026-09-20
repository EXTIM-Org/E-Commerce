"use server";

import { z } from "zod";
import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const askQuestionSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  text: z.string().min(3, "متن پرسش باید حداقل ۳ کاراکتر باشد").max(1000, "متن پرسش بسیار طولانی است"),
});

const answerQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  text: z.string().min(3, "متن پاسخ باید حداقل ۳ کاراکتر باشد").max(1000, "متن پاسخ بسیار طولانی است"),
});

export async function askQuestion(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "برای ثبت پرسش باید وارد حساب کاربری خود شوید." };
    }

    const data = {
      productId: formData.get("productId") as string,
      text: formData.get("text") as string,
    };

    const validatedData = askQuestionSchema.parse(data);

    await db.orm.public.Question.create({
      productId: validatedData.productId,
      userId: session.userId as string,
      text: validatedData.text,
    });

    // Revalidate the product page to show the new question
    // We don't have the slug here easily, but we can revalidate the general path if we pass it or just let client refresh
    // For now, we will return success. The client component can refresh.
    
    return { success: true };
  } catch (error) {
    console.error("Error creating question:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "خطایی در ثبت پرسش رخ داد." };
  }
}

export async function answerQuestion(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "برای ثبت پاسخ باید وارد حساب کاربری خود شوید." };
    }

    const data = {
      questionId: formData.get("questionId") as string,
      text: formData.get("text") as string,
    };

    const validatedData = answerQuestionSchema.parse(data);

    const isAdmin = session.role === "ADMIN";

    await db.orm.public.Answer.create({
      questionId: validatedData.questionId,
      userId: session.userId as string,
      text: validatedData.text,
      isAdmin,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating answer:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "خطایی در ثبت پاسخ رخ داد." };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "عدم دسترسی" };
    }

    await db.orm.public.Question.where({ id: questionId }).delete();
    revalidatePath("/admin/qa");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "خطا در حذف پرسش" };
  }
}

export async function deleteAnswer(answerId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "عدم دسترسی" };
    }

    await db.orm.public.Answer.where({ id: answerId }).delete();
    revalidatePath("/admin/qa");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting answer:", error);
    return { success: false, error: "خطا در حذف پاسخ" };
  }
}
