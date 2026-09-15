import * as Sentry from '@sentry/sveltekit';

import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const sentryEnabled =
	!dev && Boolean(env.PUBLIC_SENTRY_DSN) && Boolean(env.PUBLIC_SENTRY_ENVIRONMENT);

Sentry.init({
	enabled: sentryEnabled,
	dsn: sentryEnabled ? env.PUBLIC_SENTRY_DSN : undefined,
	environment: sentryEnabled ? env.PUBLIC_SENTRY_ENVIRONMENT : undefined,

	tracesSampleRate: 0.1,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// Enable sending user PII (Personally Identifiable Information)
	// https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
	sendDefaultPii: true
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = Sentry.handleErrorWithSentry();
