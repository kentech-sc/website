import { injectAnalytics } from '@vercel/analytics/sveltekit';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const isProduction = env.PUBLIC_SENTRY_ENVIRONMENT === 'production';

if (browser && isProduction) {
	injectAnalytics({ mode: 'production' });
	injectSpeedInsights();
}
