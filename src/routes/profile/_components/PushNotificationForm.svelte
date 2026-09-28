<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';

	import DiningNotificationSettings from './DiningNotificationSettings.svelte';

	import type { DiningSlot } from '$lib/types/dining.type.js';
	import type { DiningNotificationPreferences } from '$lib/types/push-subscription.type.js';

	import { env } from '$env/dynamic/public';
	import {
		withTimeout,
		subscribe,
		unsubscribe,
		loadDiningPreferences,
		saveDiningPreferences,
		isSupported,
		ENABLE_FAILED_MESSAGE
	} from '$lib/client/push-subscription.js';

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

	async function readSubscriptionState() {
		const nextSupported = isSupported() && Boolean(env.PUBLIC_VAPID_PUBLIC_KEY);

		if (!nextSupported) {
			supported = false;
			subscribed = false;
			checked = true;
			return;
		}

		const registration = await withTimeout(
			navigator.serviceWorker.ready,
			'서비스 워커 준비 시간이 초과되었습니다.'
		);
		const subscription = await registration.pushManager.getSubscription();
		supported = true;
		subscribed = Boolean(subscription);
		if (subscription) {
			try {
				diningPreferences = await loadDiningPreferences(subscription);
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
			diningPreferences = await saveDiningPreferences(diningPreferences);
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
			await subscribe();
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
			await unsubscribe();
		} catch (error) {
			console.warn('Failed to disable push notifications:', error);
			errorMessage = '푸시 알림 설정 해제에 실패했습니다.';
		} finally {
			loading = false;
			await refreshState();
		}
	}

	async function refreshState() {
		try {
			await readSubscriptionState();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : ENABLE_FAILED_MESSAGE;
		} finally {
			checked = true;
		}
	}
	onMount(() => {
		void refreshState();
	});
</script>

<section class="settings-form">
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
			<DiningNotificationSettings
				preferences={diningPreferences}
				disabled={loading || preferenceLoading !== null}
				onChange={updateDiningPreference}
			/>
			<button
				class="ui-button is-danger"
				type="button"
				onclick={disableNotifications}
				disabled={loading}
			>
				<BellOff size="0.8rem" />
				<span>{loading ? '차단 중...' : '차단하기'}</span>
			</button>
		{:else}
			<button
				class="ui-button is-primary"
				type="button"
				onclick={enableNotifications}
				disabled={loading}
			>
				<Bell size="0.8rem" />
				<span>{loading ? '허용 중...' : '허용하기'}</span>
			</button>
		{/if}
	{/if}
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
	}

	h4 {
		color: var(--secondary);
		font-weight: 500;
		font-size: 0.9rem;
	}

	p {
		margin-top: 0.2rem;
		color: var(--gray);
		font-size: 0.7rem;
	}

	button {
		margin-top: 0.6rem;
		margin-inline-start: auto;
	}

	.error {
		margin-top: 0.6rem;
	}
</style>
