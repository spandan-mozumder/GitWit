import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  
  debug: false,
  
  environment: process.env.NODE_ENV,
  
  enabled: process.env.NODE_ENV === "production",
  
  beforeSend(event, hint) {
    if (event.exception) {
      console.error('Sentry caught exception:', hint.originalException || hint.syntheticException);
    }
    return event;
  },
});
