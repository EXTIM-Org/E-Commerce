import { db } from "./src/prisma/db";

async function run() {
  const cart = await db.orm.public.Cart.where({ userId: '5b968477-5698-4cb3-ae78-77bdb40047bc' }).include("items").first();
  console.log("CART:", cart);
  await db.close();
}

run();
