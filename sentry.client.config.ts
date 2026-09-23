import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true, // Track user IPs and cookies
  tracesSampleRate: 1, // 100% tracing (can be lowered in production)
  debug: false,
});
