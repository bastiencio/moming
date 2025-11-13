/**
 * Error Tracking Utility
 * Integrates with error tracking services like Sentry or LogRocket
 * 
 * To enable error tracking:
 * 1. Install your chosen service: npm install @sentry/react
 * 2. Initialize it in src/main.tsx before rendering
 * 3. Update the captureException function below
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  page?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Capture and report errors to external service
 * Currently logs to console in development and sends to service in production
 */
export const captureException = (
  error: Error | string,
  context?: ErrorContext
) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', {
      message: errorMessage,
      stack: errorStack,
      context,
    });
  } else {
    // Production: Send to error tracking service
    // Example with Sentry (uncomment when installed):
    // import * as Sentry from "@sentry/react";
    // Sentry.captureException(error, { contexts: { app: context } });
    
    // Example with LogRocket (uncomment when installed):
    // import LogRocket from 'logrocket';
    // LogRocket.captureException(error, { context });
  }
};

/**
 * Log user action for debugging and analytics
 */
export const logUserAction = (action: string, details?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Action] ${action}`, details);
  } else {
    // Production: Send to analytics service
    // Example with Sentry:
    // import * as Sentry from "@sentry/react";
    // Sentry.captureMessage(`User action: ${action}`, 'info');
    
    // Example with LogRocket:
    // import LogRocket from 'logrocket';
    // LogRocket.log(`User action: ${action}`, details);
  }
};

/**
 * Initialize error tracking service
 * Call this once in your app initialization
 */
export const initErrorTracking = () => {
  // Example: Initialize Sentry
  // import * as Sentry from "@sentry/react";
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.init({
  //     dsn: import.meta.env.VITE_SENTRY_DSN,
  //     environment: process.env.NODE_ENV,
  //     tracesSampleRate: 0.1,
  //   });
  // }
  
  // Example: Initialize LogRocket
  // import LogRocket from 'logrocket';
  // if (process.env.NODE_ENV === 'production') {
  //   LogRocket.init(import.meta.env.VITE_LOGROCKET_APP_ID);
  // }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, userEmail?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('User context set:', { userId, userEmail });
  } else {
    // Example with Sentry:
    // import * as Sentry from "@sentry/react";
    // Sentry.setUser({ id: userId, email: userEmail });
    
    // Example with LogRocket:
    // import LogRocket from 'logrocket';
    // LogRocket.identify(userId, { email: userEmail });
  }
};
