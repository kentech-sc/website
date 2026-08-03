import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	headLinkOptions: {
		basePath: '/icons/',
		preset: '2023'
	},
	preset: minimal2023Preset,
	images: ['static/icons/logo.png']
});
