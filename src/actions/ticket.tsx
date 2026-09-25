"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { canManageSupport } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { notificationQueue } from "@/jobs/queues";
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

    // Send notifications
    const user = await db.orm.public.User.where({ id: session.userId as string }).first();
    if (user) {
      if (user.email) {
        const html = `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>سلام ${user.name || "کاربر عزیز"}،</h2>
            <p>تیکت جدید شما با موضوع <strong>"${subject}"</strong> با موفقیت ثبت شد.</p>
            <p>همکاران ما در بخش پشتیبانی به زودی به تیکت شما پاسخ خواهند داد.</p>
            <p>با تشکر،<br/>تیم پشتیبانی</p>
          </div>
        `;
        await notificationQueue.add("send-email", {
          type: "email",
          payload: {
            to: user.email,
            subject: "تیکت شما با موفقیت ثبت شد",
            html,
          }
        });
      }
      
      if (user.phoneNumber) {
        await notificationQueue.add("send-sms", {
          type: "sms",
          payload: {
            to: user.phoneNumber,
            text: `اکستیم\nتیکت جدید شما با موضوع "${subject}" ثبت شد و به زودی پاسخ داده خواهد شد.`,
          }
        });
      }
    }

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
            const appUrl = process.env.NEXT_PUBLIC_APP_URL;
            if (!appUrl) {
              throw new Error("NEXT_PUBLIC_APP_URL is not defined in environment variables");
            }
            const html = await render(
              <TicketReplyEmail
                customerName={user.name || "کاربر عزیز"}
                ticketId={ticket.id}
                ticketSubject={ticket.subject}
                replyText={text}
                ticketUrl={`${appUrl}/profile/tickets/${ticket.id}`}
              />
            );
            
            await notificationQueue.add("send-email", {
              type: "email",
              payload: {
                to: user.email,
                subject: `پاسخ جدید به تیکت: ${ticket.subject}`,
                html,
              }
            });
          }

          if (user.phoneNumber) {
            await notificationQueue.add("send-sms", {
              type: "sms",
              payload: {
                to: user.phoneNumber,
                text: `اکستیم\nپاسخ جدیدی برای تیکت "${ticket.subject}" ثبت شد.\nجهت مشاهده به پروفایل خود مراجعه کنید.`,
              }
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

export async function submitTicketFeedback(ticketId: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const ticket = await db.orm.public.Ticket.where({ id: ticketId }).first();
    if (!ticket) return { success: false, error: "تیکت یافت نشد" };
    if (ticket.userId !== session.userId) return { success: false, error: "Unauthorized" };
    if (ticket.status !== "CLOSED" && ticket.status !== "RESOLVED") {
      return { success: false, error: "امکان ثبت نظر برای تیکت باز وجود ندارد" };
    }

    const isLike = formData.get("isLike") ? formData.get("isLike") === "true" : null;
    const rating = formData.get("rating") ? parseInt(formData.get("rating") as string, 10) : null;
    const comment = formData.get("comment") as string | null;

    const existing = await db.orm.public.TicketFeedback.where({ ticketId }).first();
    if (existing) {
      await db.orm.public.TicketFeedback.where({ id: existing.id }).update({
        isLike,
        rating,
        comment
      });
    } else {
      await db.orm.public.TicketFeedback.create({
        ticketId,
        isLike,
        rating,
        comment
      });
    }

    revalidatePath(`/profile/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit ticket feedback:", error);
    return { success: false, error: "خطایی رخ داد" };
  }
}

