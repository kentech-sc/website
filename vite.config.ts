import path from 'node:path';

import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: [path.resolve('src/style')]
			}
		}
	},
	plugins: [
		sentrySvelteKit({
			autoUploadSourceMaps:
				process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
		}),
		sveltekit()
	]
});
