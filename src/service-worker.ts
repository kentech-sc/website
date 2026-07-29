/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{
		url: string;
		revision?: string | null;
	}>;
};

precacheAndRoute(self.__WB_MANIFEST ?? []);
cleanupOutdatedCaches();

registerRoute(({ request }) => request.mode === 'navigate', new NetworkOnly());

setCatchHandler(async ({ event }) => {
	if (event.request.mode === 'navigate') {
		return (
			(await matchPrecache('/offline.html')) ??
			new Response('오프라인 상태입니다.', {
				status: 503,
				headers: {
					'content-type': 'text/plain; charset=utf-8'
				}
			})
		);
	}

	return Response.error();
});

self.addEventListener('install', () => {
	void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((cacheName) => cacheName.startsWith('cache-'))
					.map((cacheName) => caches.delete(cacheName))
			);
			await self.clients.claim();
		})()
	);
});

self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	const title = data.title ?? '새 알림';

	event.waitUntil(
		self.registration.showNotification(title, {
			body: data.body ?? '',
			icon: '/icons/pwa-192x192.png',
			data: {
				url: data.url ?? '/'
			}
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const url = event.notification.data?.url ?? '/';

	event.waitUntil(
		(async () => {
			const windowClients = await self.clients.matchAll({
				type: 'window',
				includeUncontrolled: true
			});

			for (const client of windowClients) {
				if ('navigate' in client && typeof client.navigate === 'function') {
					await client.navigate(url);
				}
				await client.focus();
				return;
			}

			await self.clients.openWindow(url);
		})()
	);
});
