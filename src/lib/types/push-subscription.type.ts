export interface PushSubscriptionKeys {
	p256dh: string;
	auth: string;
}

export interface PushSubscriptionInput {
	endpoint: string;
	expirationTime?: number | null;
	keys: PushSubscriptionKeys;
}

export interface PushSubscriptionCreate {
	userId: string;
	endpoint: string;
	expirationTime: number | null;
	keys: PushSubscriptionKeys;
	userAgent: string;
}

export interface PushSubscriptionEntity extends PushSubscriptionCreate {
	createdAt: string;
	updatedAt: string;
}

export interface PushNotificationPayload {
	title: string;
	body: string;
	url: string;
}
