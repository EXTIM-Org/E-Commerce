import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Base logger configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In development, use pino-pretty for readable console logs.
  // In production, output raw JSON for Elasticsearch/Kibana/Datadog.
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * Returns a logger instance, optionally bound to a specific user ID for better traceability.
 */
export function getLogger(userId?: string) {
  if (userId) {
    return logger.child({ userId });
  }
  return logger;
}
