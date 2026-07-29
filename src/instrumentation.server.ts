import * as Sentry from '@sentry/sveltekit';

import { dev } from '$app/environment';
import * as publicEnv from '$env/static/public';

const staticPublicEnv = publicEnv as Record<string, string | undefined>;
const sentryDsn = staticPublicEnv.PUBLIC_SENTRY_DSN;
const sentryEnvironment = staticPublicEnv.PUBLIC_SENTRY_ENVIRONMENT;

const sentryEnabled = !dev && Boolean(sentryDsn) && Boolean(sentryEnvironment);

Sentry.init({
	enabled: sentryEnabled,
	dsn: sentryEnabled ? sentryDsn : undefined,
	environment: sentryEnabled ? sentryEnvironment : undefined,
	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
