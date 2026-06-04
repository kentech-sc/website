export type FlashKind = 'info' | 'success' | 'error';

export type FlashMessage = {
	kind: FlashKind;
	message: string;
};
