declare module 'web-push' {
	export interface WebPushSubscription {
		endpoint: string;
		expirationTime?: number | null;
		keys: {
			p256dh: string;
			auth: string;
		};
	}

	export function setVapidDetails(
		subject: string,
		publicKey: string,
		privateKey: string
	): void;

	export function sendNotification(
		subscription: WebPushSubscription,
		payload?: string
	): Promise<void>;

	const webpush: {
		setVapidDetails: typeof setVapidDetails;
		sendNotification: typeof sendNotification;
	};

	export default webpush;
}
