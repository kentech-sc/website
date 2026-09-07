<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';

	import type { DiningSlot } from '$lib/types/dining.type.js';
	import type { DiningNotificationPreferences } from '$lib/types/push-subscription.type.js';

	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';

	let loading = $state(false);
	let checked = $state(false);
	let supported = $state(false);
	let subscribed = $state(false);
	let errorMessage = $state('');
	let preferenceLoading = $state<DiningSlot | null>(null);
	let diningPreferences = $state<DiningNotificationPreferences>({
		breakfast: true,
		lunch: true,
		dinner: true
	});

	const PUSH_OPERATION_TIMEOUT_MS = 5_000;
	const ENABLE_FAILED_MESSAGE =
		'푸시 알림 설정에 실패했습니다. 인터넷 연결 상태를 확인하거나 다른 웹 브라우저에서 다시 시도해 주세요.';

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

	async function loadDiningPreferences(subscription: PushSubscription) {
		const response = await fetch('/api/push/subscription', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(subscription.toJSON())
		});

		const result = (await response.json()) as {
			message?: string;
			diningPreferences?: DiningNotificationPreferences;
		};
		if (!response.ok || !result.diningPreferences) {
			throw new Error(result.message ?? '학식 알림 설정을 불러오지 못했습니다.');
		}
		diningPreferences = result.diningPreferences;
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
		if (subscription) {
			try {
				await loadDiningPreferences(subscription);
			} catch (error) {
				console.warn('Failed to load dining notification preferences:', error);
				errorMessage = '학식 알림 설정을 불러오지 못했습니다.';
			}
		}
		checked = true;
	}

	async function updateDiningPreference(slot: DiningSlot, enabled: boolean) {
		if (preferenceLoading) return;

		const previousPreferences = diningPreferences;
		diningPreferences = { ...diningPreferences, [slot]: enabled };
		preferenceLoading = slot;
		errorMessage = '';
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			if (!subscription) throw new Error('등록된 푸시 구독이 없습니다.');

			const response = await fetch('/api/push/subscription', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					endpoint: subscription.endpoint,
					diningPreferences
				})
			});
			const result = (await response.json()) as {
				message?: string;
				diningPreferences?: DiningNotificationPreferences;
			};
			if (!response.ok || !result.diningPreferences) {
				throw new Error(result.message ?? '학식 알림 설정 변경에 실패했습니다.');
			}
			diningPreferences = result.diningPreferences;
		} catch (error) {
			console.warn('Failed to update dining notification preferences:', error);
			diningPreferences = previousPreferences;
			errorMessage = '학식 알림 설정 변경에 실패했습니다.';
		} finally {
			preferenceLoading = null;
		}
	}

	async function enableNotifications() {
		if (!env.PUBLIC_VAPID_PUBLIC_KEY) {
			errorMessage = ENABLE_FAILED_MESSAGE;
			return;
		}

		if (!isSupported()) {
			errorMessage = ENABLE_FAILED_MESSAGE;
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const permissionResult = await withTimeout(
				Notification.requestPermission(),
				'알림 권한 요청이 응답하지 않습니다. 브라우저 또는 기기 설정에서 알림 권한을 확인해 주세요.'
			);

			if (permissionResult !== 'granted') {
				errorMessage = ENABLE_FAILED_MESSAGE;
				return;
			}

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

			const subscription =
				existingSubscription ??
				(await withTimeout(
					registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: applicationServerKey as BufferSource
					}),
					'브라우저의 푸시 서비스에 연결할 수 없습니다. Chrome, Edge 또는 Firefox에서 다시 시도해 주세요.'
				));

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
		} catch (error) {
			console.warn('Failed to enable push notifications:', error);
			errorMessage = ENABLE_FAILED_MESSAGE;
		} finally {
			loading = false;
			await refreshState();
		}
	}

	async function disableNotifications() {
		if (!isSupported()) {
			errorMessage = '푸시 알림 설정 해제에 실패했습니다.';
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (!subscription) {
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
			console.warn('Failed to disable push notifications:', error);
			errorMessage = '푸시 알림 설정 해제에 실패했습니다.';
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

	{#if errorMessage}
		<div class="error">{errorMessage}</div>
	{/if}

	{#if checked && supported}
		{#if subscribed}
			<fieldset class="dining-preferences" disabled={loading || preferenceLoading !== null}>
				<legend>학식 알림</legend>
				<p>이 기기에서 받고 싶은 식사 알림을 선택하세요.</p>
				<div class="preference-options">
					<label>
						<input
							type="checkbox"
							checked={diningPreferences.breakfast}
							onchange={(event) => updateDiningPreference('breakfast', event.currentTarget.checked)}
						/>
						<span>조식</span>
					</label>
					<label>
						<input
							type="checkbox"
							checked={diningPreferences.lunch}
							onchange={(event) => updateDiningPreference('lunch', event.currentTarget.checked)}
						/>
						<span>중식</span>
					</label>
					<label>
						<input
							type="checkbox"
							checked={diningPreferences.dinner}
							onchange={(event) => updateDiningPreference('dinner', event.currentTarget.checked)}
						/>
						<span>석식</span>
					</label>
				</div>
			</fieldset>
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

	.dining-preferences {
		margin-top: 0.8rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.6rem;
		width: 100%;
	}

	.dining-preferences legend {
		padding: 0 0.2rem;
		font-weight: 600;
		font-size: 0.8rem;
	}

	.dining-preferences p {
		margin: 0 0 0.5rem;
	}

	.preference-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
	}

	.preference-options label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		cursor: pointer;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.4rem 0.5rem;
		font-size: 0.8rem;
	}

	.preference-options input {
		margin: 0;
	}
</style>
