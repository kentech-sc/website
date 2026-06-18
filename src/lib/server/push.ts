import webpush from 'web-push';

import type {
	PushNotificationPayload,
	PushSubscriptionEntity,
	PushSubscriptionInput
} from '$lib/types/push-subscription.type.js';

import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { PushSubscriptionModel } from '$lib/models/push-subscription.model.js';
import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { toPojo } from '$lib/shared/utils.js';

const PUSH_CHUNK_SIZE = 100;

function getPushConfig() {
	const publicKey = publicEnv.PUBLIC_VAPID_PUBLIC_KEY;
	const privateKey = privateEnv.VAPID_PRIVATE_KEY;
	const subject = privateEnv.VAPID_SUBJECT;

	if (!publicKey || !privateKey || !subject) {
		throw new AppError(APP_ERROR.INTERNAL, '푸시 알림 설정이 완료되지 않았습니다.');
	}

	return { publicKey, privateKey, subject };
}

function configureWebPush() {
	const { publicKey, privateKey, subject } = getPushConfig();
	webpush.setVapidDetails(subject, publicKey, privateKey);
}

function isStalePushError(error: unknown): boolean {
	return Boolean(
		typeof error === 'object' &&
			error !== null &&
			'statusCode' in error &&
			(error.statusCode === 404 || error.statusCode === 410)
	);
}

async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<number> {
	const result = await PushSubscriptionModel.deleteOne({ endpoint });
	return result.deletedCount ?? 0;
}

async function sendPushNotification(
	subscription: PushSubscriptionEntity,
	payload: PushNotificationPayload
): Promise<'sent' | 'stale'> {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
		return 'sent';
	} catch (error) {
		if (isStalePushError(error)) {
			await deletePushSubscriptionByEndpoint(subscription.endpoint);
			return 'stale';
		}

		throw error;
	}
}

export function isPushSubscriptionInput(value: unknown): value is PushSubscriptionInput {
	if (!value || typeof value !== 'object') return false;

	const subscription = value as Partial<PushSubscriptionInput>;
	const expirationTime = subscription.expirationTime;

	return Boolean(
		typeof subscription.endpoint === 'string' &&
			subscription.keys &&
			typeof subscription.keys.p256dh === 'string' &&
			typeof subscription.keys.auth === 'string' &&
			(expirationTime === undefined ||
				expirationTime === null ||
				typeof expirationTime === 'number')
	);
}

export async function saveUserPushSubscription(
	userId: string,
	subscription: PushSubscriptionInput,
	userAgent: string
): Promise<PushSubscriptionEntity> {
	return toPojo<PushSubscriptionEntity>(
		await PushSubscriptionModel.findOneAndUpdate(
			{
				userId,
				endpoint: subscription.endpoint
			},
			{
				$set: {
					expirationTime: subscription.expirationTime ?? null,
					keys: {
						p256dh: subscription.keys.p256dh,
						auth: subscription.keys.auth
					},
					userAgent
				},
				$setOnInsert: {
					userId,
					endpoint: subscription.endpoint
				}
			},
			{
				upsert: true,
				returnDocument: 'after'
			}
		).lean()
	);
}

export async function deleteUserPushSubscription(
	userId: string,
	endpoint: string
): Promise<number> {
	const result = await PushSubscriptionModel.deleteOne({ userId, endpoint });
	return result.deletedCount ?? 0;
}

export async function findUserPushSubscriptions(userId: string): Promise<PushSubscriptionEntity[]> {
	return toPojo<PushSubscriptionEntity[]>(await PushSubscriptionModel.find({ userId }).lean());
}

export async function findAllPushSubscriptions(): Promise<PushSubscriptionEntity[]> {
	return toPojo<PushSubscriptionEntity[]>(await PushSubscriptionModel.find().lean());
}

export async function sendPushToUser(
	userId: string,
	payload: PushNotificationPayload
): Promise<{ totalCount: number; sentCount: number; staleCount: number }> {
	configureWebPush();

	const subscriptions = await findUserPushSubscriptions(userId);
	let sentCount = 0;
	let staleCount = 0;

	for (const subscription of subscriptions) {
		const result = await sendPushNotification(subscription, payload);

		if (result === 'sent') {
			sentCount += 1;
			continue;
		}

		staleCount += 1;
	}

	return {
		totalCount: subscriptions.length,
		sentCount,
		staleCount
	};
}

export async function sendPushToAllSubscribers(
	payload: PushNotificationPayload
): Promise<{ totalCount: number; sentCount: number; staleCount: number; failedCount: number }> {
	configureWebPush();

	const subscriptions = await findAllPushSubscriptions();
	let sentCount = 0;
	let staleCount = 0;
	let failedCount = 0;

	for (let index = 0; index < subscriptions.length; index += PUSH_CHUNK_SIZE) {
		const chunk = subscriptions.slice(index, index + PUSH_CHUNK_SIZE);
		const results = await Promise.allSettled(
			chunk.map((subscription) => sendPushNotification(subscription, payload))
		);

		for (const result of results) {
			if (result.status === 'fulfilled') {
				if (result.value === 'sent') {
					sentCount += 1;
				} else {
					staleCount += 1;
				}

				continue;
			}

			failedCount += 1;
			console.error('푸시 알림 발송에 실패했습니다.', result.reason);
		}
	}

	return {
		totalCount: subscriptions.length,
		sentCount,
		staleCount,
		failedCount
	};
}
