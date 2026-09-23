import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

// Setup Cart Cleanup Queue
export const cartCleanupQueue = new Queue('cart-cleanup-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10, // keep last 10 failed jobs for debugging
  },
});

// Setup Flash Sale Queue
export const flashSaleQueue = new Queue('flash-sale-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
  },
});
