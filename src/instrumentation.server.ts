import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://0173444c8cf5871ec5ba8fa075cae2a5@o4509551707160576.ingest.us.sentry.io/4510423166287872',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
