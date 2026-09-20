import { db } from "../prisma/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@extim.com";
  const password = "Aa2916519";

  const existingUser = await db.orm.public.User.where({ email }).first();
  if (existingUser) {
    console.log("Admin user already exists. Updating role to ADMIN...");
    await db.orm.public.User.where({ email }).update({
      role: 'ADMIN'
    });
    console.log("Updated.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await db.orm.public.User.create({
    email,
    passwordHash,
    role: 'ADMIN',
    name: 'مدیر سیستم'
  });

  console.log("Admin user created successfully:", admin.id);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
