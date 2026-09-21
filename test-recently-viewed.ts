import { db } from "./src/prisma/db";
import { getProductsByIds } from "./src/actions/recently-viewed";

async function run() {
  const products = await db.orm.public.Product.all();
  if (products.length === 0) {
    console.log("No products in DB");
    return;
  }
  const ids = [products[0].id];
  console.log("Testing with IDs:", ids);
  
  const result = await getProductsByIds(ids);
  console.log("Result:", JSON.stringify(result, null, 2));
}
run();
