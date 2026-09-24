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

// Setup Key Rotation Queue
export const keyRotationQueue = new Queue('key-rotation-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
  },
});

// Setup Notification Queue (Email & SMS)
export const notificationQueue = new Queue('notification-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Setup Bulk Import Queue
export const bulkImportQueue = new Queue('bulk-import-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
  },
});

