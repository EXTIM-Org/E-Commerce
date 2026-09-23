"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { canManageSupport } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { render } from "@react-email/render";
import TicketReplyEmail from "@/emails/TicketReplyEmail";

export async function createTicket(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "لطفاً ابتدا وارد حساب کاربری خود شوید." };
    }

    const subject = formData.get("subject") as string;
    const department = formData.get("department") as any; // TicketDepartment
    const priority = formData.get("priority") as any; // TicketPriority
    const message = formData.get("message") as string;
    const orderId = formData.get("orderId") as string | null;
    const productId = formData.get("productId") as string | null;

    if (!subject || !department || !priority || !message) {
      return { success: false, error: "تمامی فیلدهای ستاره‌دار الزامی هستند." };
    }

    const ticket = await db.orm.public.Ticket.create({
      subject,
      department,
      priority,
      status: "OPEN",
      userId: session.userId as string,
      orderId: orderId || null,
      productId: productId || null,
    });

    await db.orm.public.TicketMessage.create({
      ticketId: ticket.id,
      userId: session.userId as string,
      text: message,
      isInternal: false,
    });

    revalidatePath("/profile/tickets");
    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return { success: false, error: "خطایی در ثبت تیکت رخ داد." };
  }
}

export async function addTicketMessage(ticketId: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const text = formData.get("text") as string;
    const isInternalStr = formData.get("isInternal") as string;
    const isInternal = isInternalStr === "true";
    
    // Authorization check
    const ticket = await db.orm.public.Ticket.where({ id: ticketId }).first();
    if (!ticket) return { success: false, error: "تیکت یافت نشد" };
    
    const isAdmin = canManageSupport(session.role as string);
    if (!isAdmin && ticket.userId !== session.userId) {
       return { success: false, error: "Unauthorized" };
    }
    
    if (isInternal && !isAdmin) {
      return { success: false, error: "شما دسترسی ثبت یادداشت داخلی ندارید" };
    }

    if (!text) {
      return { success: false, error: "متن پیام الزامی است." };
    }

    await db.orm.public.TicketMessage.create({
      ticketId,
      userId: session.userId as string,
      text,
      isInternal,
    });

    const isCustomer = session.userId === ticket.userId;

    // Update ticket status
    if (!isCustomer && !isInternal) {
      await db.orm.public.Ticket.where({ id: ticketId }).update({ status: "WAITING_FOR_USER" });
      
      // Send notifications
      if (ticket.userId) {
        const user = await db.orm.public.User.where({ id: ticket.userId }).first();
        if (user) {
          if (user.email) {
            const html = await render(
              <TicketReplyEmail
                customerName={user.name || "کاربر عزیز"}
                ticketId={ticket.id}
                ticketSubject={ticket.subject}
                replyText={text}
                ticketUrl={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile/tickets/${ticket.id}`}
              />
            );
            
            await sendEmail({
              to: user.email,
              subject: `پاسخ جدید به تیکت: ${ticket.subject}`,
              html,
            });
          }

          if (user.phoneNumber) {
            await sendSms({
              to: user.phoneNumber,
              text: `اکستیم\nپاسخ جدیدی برای تیکت "${ticket.subject}" ثبت شد.\nجهت مشاهده به پروفایل خود مراجعه کنید.`,
            });
          }
        }
      }
    } else if (isCustomer) {
      await db.orm.public.Ticket.where({ id: ticketId }).update({ status: "OPEN" });
    }

    revalidatePath(`/profile/tickets/${ticketId}`);
    revalidatePath(`/admin/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add ticket message:", error);
    return { success: false, error: "خطایی رخ داد." };
  }
}

export async function updateTicketStatus(ticketId: string, status: any) {
  try {
    const session = await getSession();
    if (!session || !canManageSupport(session.role as string)) {
      throw new Error("Unauthorized");
    }

    await db.orm.public.Ticket.where({ id: ticketId }).update({ status });

    revalidatePath("/admin/tickets");
    revalidatePath(`/admin/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update ticket status:", error);
    return { success: false };
  }
}

export async function closeUserTicket(ticketId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const ticket = await db.orm.public.Ticket.where({ id: ticketId }).first();
    if (!ticket) return { success: false, error: "تیکت یافت نشد" };
    if (ticket.userId !== session.userId) return { success: false, error: "Unauthorized" };

    await db.orm.public.Ticket.where({ id: ticketId }).update({ status: "CLOSED" });

    revalidatePath("/profile/tickets");
    revalidatePath(`/profile/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to close ticket:", error);
    return { success: false };
  }
}
