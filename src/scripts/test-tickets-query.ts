import { db } from "@/prisma/db";

async function main() {
  const allTickets = await db.orm.public.Ticket.all();
  console.log("Total tickets in DB:", allTickets.length);

  const userIdFilter = "a5635cf2-f11e-4aa9-b6e2-a535f6030303";
  let query = db.orm.public.Ticket
    .orderBy(t => t.updatedAt.desc())
    .include("user", u => u.select("name", "email"));
    
  if (userIdFilter) {
    query = query.where({ userId: userIdFilter }) as any;
  }

  const tickets = await query.all();
  console.log("Tickets found for user:", tickets.length);
  await db.close();
}

main().catch(console.error);
