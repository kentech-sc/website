<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';

	let loading = $state(false);
	let checked = $state(false);
	let supported = $state(false);
	let subscribed = $state(false);
	let message = $state('');

	const PUSH_OPERATION_TIMEOUT_MS = 15_000;

	function withTimeout<T>(promise: Promise<T>, errorMessage: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error(errorMessage)), PUSH_OPERATION_TIMEOUT_MS);

			promise.then(
				(value) => {
					clearTimeout(timer);
					resolve(value);
				},
				(error: unknown) => {
					clearTimeout(timer);
					reject(error);
				}
			);
		});
	}

	function base64UrlToUint8Array(base64Url: string): Uint8Array {
		const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
		const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
		const raw = atob(base64);

		return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
	}

	function hasSameApplicationServerKey(
		subscription: PushSubscription,
		expectedKey: Uint8Array
	): boolean {
		const currentKey = subscription.options.applicationServerKey;
		if (!currentKey || currentKey.byteLength !== expectedKey.byteLength) return false;

		const currentBytes = new Uint8Array(currentKey);
		return expectedKey.every((byte, index) => currentBytes[index] === byte);
	}

	function isSupported(): boolean {
		return (
			browser && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
		);
	}

	async function refreshState() {
		const nextSupported = isSupported() && Boolean(env.PUBLIC_VAPID_PUBLIC_KEY);

		if (!nextSupported) {
			supported = false;
			subscribed = false;
			checked = true;
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		supported = true;
		subscribed = Boolean(subscription);
		checked = true;
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
		message = '알림 권한을 확인하고 있습니다.';

		try {
			const permissionResult = await withTimeout(
				Notification.requestPermission(),
				'알림 권한 요청이 응답하지 않습니다. 브라우저 또는 기기 설정에서 알림 권한을 확인해 주세요.'
			);

			if (permissionResult !== 'granted') {
				message = '알림 권한이 허용되지 않았습니다.';
				return;
			}

			message = '서비스 워커를 확인하고 있습니다.';
			const registration = await withTimeout(
				navigator.serviceWorker.ready,
				'서비스 워커가 준비되지 않았습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.'
			);
			const applicationServerKey = base64UrlToUint8Array(env.PUBLIC_VAPID_PUBLIC_KEY);
			let existingSubscription = await registration.pushManager.getSubscription();

			if (
				existingSubscription &&
				!hasSameApplicationServerKey(existingSubscription, applicationServerKey)
			) {
				await existingSubscription.unsubscribe();
				existingSubscription = null;
			}

			message = '푸시 알림 구독을 생성하고 있습니다.';
			const subscription =
				existingSubscription ??
				(await withTimeout(
					registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: applicationServerKey as BufferSource
					}),
					'브라우저의 푸시 서비스에 연결할 수 없습니다. Chrome, Edge 또는 Firefox에서 다시 시도해 주세요.'
				));

			message = '푸시 알림 구독을 저장하고 있습니다.';
			const response = await withTimeout(
				fetch('/api/push/subscription', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify(subscription.toJSON())
				}),
				'푸시 알림 구독 저장 요청이 응답하지 않습니다.'
			);

			const result = (await response.json()) as { message?: string };
			if (!response.ok) {
				throw new Error(result.message ?? '푸시 구독 저장에 실패했습니다.');
			}

			message = '푸시 알림이 활성화되었습니다.';
		} catch (error) {
			console.error('Failed to enable push notifications:', error);
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
				message = '이 기기에는 활성화된 푸시 구독이 없습니다.';
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
	<h4>
		<Smartphone size="0.8rem" />
		<span>푸시 알림 설정</span>
	</h4>

	<p>알림을 허용하면 학생회의 소식이나 학식 메뉴 알림을 빠르게 받을 수 있습니다.</p>

	{#if message}
		<div class="error">{message}</div>
	{/if}

	{#if checked && supported}
		{#if subscribed}
			<button class="error-btn" type="button" onclick={disableNotifications} disabled={loading}>
				<BellOff size="0.8rem" />
				<span>{loading ? '차단 중...' : '차단하기'}</span>
			</button>
		{:else}
			<button class="success-btn" type="button" onclick={enableNotifications} disabled={loading}>
				<Bell size="0.8rem" />
				<span>{loading ? '허용 중...' : '허용하기'}</span>
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
