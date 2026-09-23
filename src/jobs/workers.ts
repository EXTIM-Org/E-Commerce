import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { db } from '../prisma/db';

export function setupWorkers() {
  console.log('[BullMQ] Setting up background workers...');

  const cartWorker = new Worker('cart-cleanup-queue', async (job: Job) => {
    const { cartItemId, variantId, quantity, reservedAt } = job.data;
    
    // Check if the cart item still exists
    const cartItem = await db.orm.public.CartItem.where({ id: cartItemId }).first();
    
    // If it exists and hasn't been updated (reservedAt matches precisely)
    if (cartItem && cartItem.reservedAt && new Date(cartItem.reservedAt).getTime() === new Date(reservedAt).getTime()) {
      console.log(`[BullMQ] Releasing cart reservation for item ${cartItemId}`);
      
      const inventory = await db.orm.public.Inventory.where({ variantId }).first();
      if (inventory) {
        // Atomic release
        const plan = db.raw.sql`
          UPDATE inventory 
          SET "stockQuantity" = "stockQuantity" + ${quantity}, 
              "reservedStock" = GREATEST(0, "reservedStock" - ${quantity})
          WHERE id = ${inventory.id}
        `.affectedCount().build();
        await db.runtime().execute(plan);
      }
      
      // Delete the expired cart item
      await db.orm.public.CartItem.where({ id: cartItemId }).delete();
    }
  }, { connection: redis });

  const flashSaleWorker = new Worker('flash-sale-queue', async (job: Job) => {
    const { flashSaleId } = job.data;
    console.log(`[BullMQ] Expiring flash sale ${flashSaleId}`);
    
    await db.orm.public.FlashSale.where({ id: flashSaleId }).update({ isActive: false });
    // Cache revalidation from external worker requires calling a webhook on the Next.js server.
    // For now, the DB is updated and Next.js Time-based Revalidation will pick it up.
  }, { connection: redis });

  cartWorker.on('failed', (job, err) => console.error(`Cart Job ${job?.id} failed:`, err));
  flashSaleWorker.on('failed', (job, err) => console.error(`FlashSale Job ${job?.id} failed:`, err));

  return { cartWorker, flashSaleWorker };
}
