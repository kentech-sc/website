<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import SendHorizontal from '@lucide/svelte/icons/send-horizontal';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';

	let loading = $state(false);
	let testing = $state(false);
	let supported = $state(false);
	let subscribed = $state(false);
	let permission = $state<NotificationPermission>('default');
	let message = $state('');

	function base64UrlToUint8Array(base64Url: string): Uint8Array {
		const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
		const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
		const raw = atob(base64);

		return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
	}

	function isSupported(): boolean {
		return browser && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
	}

	async function refreshState() {
		permission = browser && 'Notification' in window ? Notification.permission : 'default';
		supported = isSupported() && Boolean(env.PUBLIC_VAPID_PUBLIC_KEY);

		if (!supported) {
			subscribed = false;
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		subscribed = Boolean(subscription);
	}

	function getErrorMessage(error: unknown, fallback: string): string {
		return error instanceof Error && error.message ? error.message : fallback;
	}

	async function enableNotifications() {
		if (!env.PUBLIC_VAPID_PUBLIC_KEY) {
			message = 'PUBLIC_VAPID_PUBLIC_KEY is not configured.';
			return;
		}

		if (!isSupported()) {
			message = 'Push notifications are not supported on this device.';
			return;
		}

		loading = true;
		message = '';

		try {
			const permissionResult = await Notification.requestPermission();
			permission = permissionResult;

			if (permissionResult !== 'granted') {
				message = 'Notification permission was not granted.';
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const existingSubscription = await registration.pushManager.getSubscription();
			const subscription =
				existingSubscription ??
				(await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: base64UrlToUint8Array(
						env.PUBLIC_VAPID_PUBLIC_KEY
					) as BufferSource
				}));

			const response = await fetch('/api/push/subscription', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(subscription.toJSON())
			});

			const result = (await response.json()) as { message?: string };
			if (!response.ok) {
				throw new Error(result.message ?? 'Failed to save push subscription.');
			}

			message = 'Notifications are enabled on this device.';
		} catch (error) {
			message = getErrorMessage(error, 'Failed to enable notifications.');
		} finally {
			loading = false;
			await refreshState();
		}
	}

	async function disableNotifications() {
		if (!isSupported()) {
			message = 'Push notifications are not supported on this device.';
			return;
		}

		loading = true;
		message = '';

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (!subscription) {
				message = 'No active push subscription found on this device.';
				return;
			}

			const response = await fetch('/api/push/subscription', {
				method: 'DELETE',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ endpoint: subscription.endpoint })
			});

			const result = (await response.json()) as { message?: string };
			if (!response.ok) {
				throw new Error(result.message ?? 'Failed to remove push subscription.');
			}

			await subscription.unsubscribe();
			message = 'Notifications are disabled on this device.';
		} catch (error) {
			message = getErrorMessage(error, 'Failed to disable notifications.');
		} finally {
			loading = false;
			await refreshState();
		}
	}

	async function sendTestNotification() {
		if (!subscribed) {
			message = 'Enable notifications first on this device.';
			return;
		}

		testing = true;
		message = '';

		try {
			const response = await fetch('/api/push/test', {
				method: 'POST'
			});

			const result = (await response.json()) as { message?: string };
			if (!response.ok) {
				throw new Error(result.message ?? 'Failed to send test notification.');
			}

			message = 'Test notification sent.';
		} catch (error) {
			message = getErrorMessage(error, 'Failed to send test notification.');
		} finally {
			testing = false;
		}
	}

	onMount(() => {
		void refreshState();
	});
</script>

<div class="push-settings container-col">
	<p class="title">
		<Smartphone size="0.8rem" />
		<span>Push Notifications</span>
	</p>

	<p class="help">
		Install this site to your home screen, then enable notifications on the device you want to receive them on.
	</p>

	<div class="status container-col">
		<p><strong>Support:</strong> {supported ? 'available' : 'unavailable'}</p>
		<p><strong>Permission:</strong> {permission}</p>
		<p><strong>Device subscription:</strong> {subscribed ? 'connected' : 'not connected'}</p>
	</div>

	<div class="actions">
		<button class="secondary-btn" type="button" onclick={enableNotifications} disabled={loading}>
			<Bell size="0.8rem" />
			<span>{loading ? 'Working...' : 'Enable'}</span>
		</button>

		<button class="secondary-btn" type="button" onclick={disableNotifications} disabled={loading}>
			<BellOff size="0.8rem" />
			<span>{loading ? 'Working...' : 'Disable'}</span>
		</button>

		<button
			class="primary-btn"
			type="button"
			onclick={sendTestNotification}
			disabled={testing || !subscribed}
		>
			<SendHorizontal size="0.8rem" />
			<span>{testing ? 'Sending...' : 'Send Test'}</span>
		</button>
	</div>

	{#if message}
		<p class="message">{message}</p>
	{/if}
</div>

<style lang="scss">
	.push-settings {
		gap: 0.6rem;
	}

	.title {
		width: 100%;
		color: var(--secondary);
		font-weight: 500;
		text-align: left;
	}

	.help,
	.status p,
	.message {
		margin: 0;
		font-size: 0.75rem;
		text-align: left;
	}

	.help,
	.status p {
		color: var(--gray-text);
	}

	.status {
		gap: 0.2rem;
		padding: 0.8rem;
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.6rem;
		background: var(--gray-bg);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.message {
		color: var(--secondary);
	}
</style>
