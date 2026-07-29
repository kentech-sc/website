import * as Sentry from '@sentry/sveltekit';

import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const sentryEnabled =
	!dev && Boolean(env.PUBLIC_SENTRY_DSN) && Boolean(env.PUBLIC_SENTRY_ENVIRONMENT);

Sentry.init({
	enabled: sentryEnabled,
	dsn: sentryEnabled ? env.PUBLIC_SENTRY_DSN : undefined,
	environment: sentryEnabled ? env.PUBLIC_SENTRY_ENVIRONMENT : undefined,
	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

console.log('SENTRY_SERVER_INITIALIZED', {
	dev,
	enabled: sentryEnabled,
	initialized: Sentry.isInitialized(),
	environment: env.PUBLIC_SENTRY_ENVIRONMENT,
	hasDsn: Boolean(env.PUBLIC_SENTRY_DSN)
});
