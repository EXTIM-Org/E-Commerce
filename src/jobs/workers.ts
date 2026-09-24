import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { db } from '../prisma/db';
import crypto from 'crypto';
import { keyRotationQueue } from './queues';
import { invalidateCachePattern } from '../lib/cache';
import { sendEmail } from '../lib/email';
import { sendSms } from '../lib/sms';
import './bulk-import-worker';

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
    await invalidateCachePattern("cache:products:*");
  }, { connection: redis });

  const keyRotationWorker = new Worker('key-rotation-queue', async (job: Job) => {
    console.log('[BullMQ] Rotating JWT Keys...');
    const current = await redis.get('jwt:secret:current');
    if (current) {
      await redis.set('jwt:secret:previous', current);
    }
    const newSecret = crypto.randomBytes(32).toString('hex');
    await redis.set('jwt:secret:current', newSecret);
    console.log('[BullMQ] JWT Keys rotated successfully.');
  }, { connection: redis });

  const notificationWorker = new Worker('notification-queue', async (job: Job) => {
    const { type, payload } = job.data;
    console.log(`[BullMQ] Processing notification: ${type}`);
    
    try {
      if (type === 'email') {
        await sendEmail(payload);
      } else if (type === 'sms') {
        await sendSms(payload);
      }
    } catch (error) {
      console.error(`[BullMQ] Failed to send ${type} notification:`, error);
      throw error; // Triggers BullMQ retry mechanism
    }
  }, { connection: redis });

  cartWorker.on('failed', (job, err) => console.error(`Cart Job ${job?.id} failed:`, err));
  flashSaleWorker.on('failed', (job, err) => console.error(`FlashSale Job ${job?.id} failed:`, err));
  keyRotationWorker.on('failed', (job, err) => console.error(`KeyRotation Job ${job?.id} failed:`, err));
  notificationWorker.on('failed', (job, err) => console.error(`Notification Job ${job?.id} failed:`, err));

  // Schedule monthly key rotation (Runs at 00:00 on day-of-month 1)
  keyRotationQueue.upsertJobScheduler('monthly-rotation', {
    pattern: '0 0 1 * *',
  }, {
    name: 'rotate-keys',
    data: {},
  });

  return { cartWorker, flashSaleWorker, keyRotationWorker, notificationWorker };
}
