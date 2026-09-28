import type { DiningNotificationPreferences } from '$lib/types/push-subscription.type.js';

import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
const PUSH_OPERATION_TIMEOUT_MS = 5_000;
export const ENABLE_FAILED_MESSAGE =
	'푸시 알림 설정에 실패했습니다. 인터넷 연결 상태를 확인하거나 다른 웹 브라우저에서 다시 시도해 주세요.';

export function withTimeout<T>(promise: Promise<T>, errorMessage: string): Promise<T> {
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

export function base64UrlToUint8Array(base64Url: string): Uint8Array {
	const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
	const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);

	return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function hasSameApplicationServerKey(
	subscription: PushSubscription,
	expectedKey: Uint8Array
): boolean {
	const currentKey = subscription.options.applicationServerKey;
	if (!currentKey || currentKey.byteLength !== expectedKey.byteLength) return false;

	const currentBytes = new Uint8Array(currentKey);
	return expectedKey.every((byte, index) => currentBytes[index] === byte);
}

export function isSupported(): boolean {
	return (
		browser && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
	);
}

export async function subscribe() {
	const publicKey = env.PUBLIC_VAPID_PUBLIC_KEY;
	if (!publicKey) throw new Error(ENABLE_FAILED_MESSAGE);

	const permissionResult = await withTimeout(
		Notification.requestPermission(),
		'알림 권한 요청이 응답하지 않습니다. 브라우저 또는 기기 설정에서 알림 권한을 확인해 주세요.'
	);

	if (permissionResult !== 'granted') {
		throw new Error(ENABLE_FAILED_MESSAGE);
	}

	const registration = await withTimeout(
		navigator.serviceWorker.ready,
		'서비스 워커가 준비되지 않았습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.'
	);
	const applicationServerKey = base64UrlToUint8Array(publicKey);
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
}

export async function unsubscribe() {
	const registration = await withTimeout(
		navigator.serviceWorker.ready,
		'서비스 워커 준비 시간이 초과되었습니다.'
	);
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
}

export async function loadDiningPreferences(subscription: PushSubscription) {
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
	return result.diningPreferences;
}

export async function saveDiningPreferences(diningPreferences: DiningNotificationPreferences) {
	const registration = await withTimeout(
		navigator.serviceWorker.ready,
		'서비스 워커 준비 시간이 초과되었습니다.'
	);
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
	return result.diningPreferences;
}
