/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];
const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis));

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					return await fetch(request);
				} catch {
					return (
						(await caches.match('/offline.html')) ??
						new Response('오프라인 상태입니다.', {
							status: 503,
							headers: {
								'content-type': 'text/plain; charset=utf-8'
							}
						})
					);
				}
			})()
		);
		return;
	}

	event.respondWith(
		caches.match(request).then(async (cached) => {
			if (cached) return cached;

			try {
				const response = await fetch(request);
				if (response.ok) {
					const cache = await caches.open(CACHE);
					await cache.put(request, response.clone());
				}
				return response;
			} catch {
				return new Response(null, {
					status: 503,
					statusText: 'Service Unavailable'
				});
			}
		})
	);
});

self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	const title = data.title ?? '새 알림';

	event.waitUntil(
		self.registration.showNotification(title, {
			body: data.body ?? '',
			icon: '/icons/android-icon-192x192.png',
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
