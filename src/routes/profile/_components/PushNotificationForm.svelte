<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';

	let loading = $state(false);
	let supported = $state(true);
	let subscribed = $state(false);
	let message = $state('');

	function base64UrlToUint8Array(base64Url: string): Uint8Array {
		const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
		const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
		const raw = atob(base64);

		return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
	}

	function isSupported(): boolean {
		return (
			browser && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
		);
	}

	async function refreshState() {
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
			message = '푸시 알림 공개키가 설정되지 않았습니다.';
			return;
		}

		if (!isSupported()) {
			message = '이 기기에서는 푸시 알림을 지원하지 않습니다.';
			return;
		}

		loading = true;
		message = '';

		try {
			const permissionResult = await Notification.requestPermission();

			if (permissionResult !== 'granted') {
				message = '알림 권한이 허용되지 않았습니다.';
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const existingSubscription = await registration.pushManager.getSubscription();
			const subscription =
				existingSubscription ??
				(await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: base64UrlToUint8Array(env.PUBLIC_VAPID_PUBLIC_KEY) as BufferSource
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
				throw new Error(result.message ?? '푸시 구독 저장에 실패했습니다.');
			}

		} catch (error) {
			message = getErrorMessage(error, '알림 활성화 중 오류가 발생했습니다.');
		} finally {
			loading = false;
			await refreshState();
		}
	}

	async function disableNotifications() {
		if (!isSupported()) {
			message = '이 기기에서는 푸시 알림을 지원하지 않습니다.';
			return;
		}

		loading = true;
		message = '';

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (!subscription) {
				message = '이 기기에 활성화된 푸시 구독이 없습니다.';
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
				throw new Error(result.message ?? '푸시 구독 해제에 실패했습니다.');
			}

			await subscription.unsubscribe();
		} catch (error) {
			message = getErrorMessage(error, '알림 비활성화 중 오류가 발생했습니다.');
		} finally {
			loading = false;
			await refreshState();
		}
	}

	onMount(() => {
		void refreshState();
	});
</script>

<section class="container-col">
	<h4 class="title">
		<Smartphone size="0.8rem" />
		<span>푸시 알림 설정</span>
	</h4>

	<p>
		먼저 앱을 설치한 뒤 알림을 허용해 주세요.
		<br />
		알림을 허용하면 학생회의 소식이나 소통식 메뉴 알림을 빠르게 받을 수 있습니다.
	</p>

	{#if message}
		<div class="error">{message}</div>
	{/if}

	{#if supported}
		{#if subscribed}
			<button class="error-btn" type="button" onclick={disableNotifications} disabled={loading}>
				<BellOff size="0.8rem" />
				<span>{loading ? '차단 중...' : '차단'}</span>
			</button>
		{:else}
			<button class="success-btn" type="button" onclick={enableNotifications} disabled={loading}>
				<Bell size="0.8rem" />
				<span>{loading ? '허용 중...' : '허용'}</span>
			</button>
		{/if}
	{/if}
</section>

<style lang="scss">
	section {
		width: 100%;
	}

	h4 {
		width: 100%;
		color: var(--secondary);
		font-weight: 500;
		font-size: 1rem;
	}

	p {
		margin-top: 0.2rem;
		width: 100%;
		color: var(--gray);
		font-size: 0.8rem;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}

	.error {
		margin-top: 0.6rem;
	}
</style>
