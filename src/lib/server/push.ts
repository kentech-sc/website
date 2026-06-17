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

function getPushConfig() {
	const publicKey = publicEnv.PUBLIC_VAPID_PUBLIC_KEY;
	const privateKey = privateEnv.VAPID_PRIVATE_KEY;
	const subject = privateEnv.VAPID_SUBJECT;

	if (!publicKey || !privateKey || !subject) {
		throw new AppError(APP_ERROR.INTERNAL, 'Push notifications are not configured.');
	}

	return { publicKey, privateKey, subject };
}

function configureWebPush() {
	const { publicKey, privateKey, subject } = getPushConfig();
	webpush.setVapidDetails(subject, publicKey, privateKey);
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
			(expirationTime === undefined || expirationTime === null || typeof expirationTime === 'number')
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

export async function findUserPushSubscriptions(
	userId: string
): Promise<PushSubscriptionEntity[]> {
	return toPojo<PushSubscriptionEntity[]>(await PushSubscriptionModel.find({ userId }).lean());
}

async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<number> {
	const result = await PushSubscriptionModel.deleteOne({ endpoint });
	return result.deletedCount ?? 0;
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
		try {
			await webpush.sendNotification(subscription, JSON.stringify(payload));
			sentCount += 1;
		} catch (error) {
			const statusCode =
				typeof error === 'object' &&
				error !== null &&
				'statusCode' in error &&
				typeof error.statusCode === 'number'
					? error.statusCode
					: 0;

			if (statusCode === 404 || statusCode === 410) {
				await deletePushSubscriptionByEndpoint(subscription.endpoint);
				staleCount += 1;
				continue;
			}

			throw error;
		}
	}

	return {
		totalCount: subscriptions.length,
		sentCount,
		staleCount
	};
}
