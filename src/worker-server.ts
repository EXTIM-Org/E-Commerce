import { setupWorkers } from './jobs/workers';
import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

console.log('🚀 Starting Background Worker Server...');
setupWorkers();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Worker Server shutting down...');
  process.exit(0);
});
