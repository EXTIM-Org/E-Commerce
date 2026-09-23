import { setupWorkers } from './jobs/workers';

console.log('🚀 Starting Background Worker Server...');
setupWorkers();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Worker Server shutting down...');
  process.exit(0);
});
