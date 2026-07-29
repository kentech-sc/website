import path from 'node:path';

import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
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
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			registerType: 'autoUpdate',
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,webmanifest,html}'],
				modifyURLPrefix: {
					'client/': '/'
				},
				manifestTransforms: [async (entries) => ({ manifest: entries })]
			},
			manifest: false
		})
	]
});
