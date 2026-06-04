import type { ActionResult } from '@sveltejs/kit';

export type MaybePromise = void | Promise<void>;
export type ActionSimpleCallback = () => MaybePromise;

export type CommonFormPolicy =
	| 'inline'
	| 'reload'
	| {
			kind: 'detail';
			notFoundRedirectTo: string;
	  };

export function isDetailPolicy(
	policy: CommonFormPolicy
): policy is Extract<CommonFormPolicy, { kind: 'detail' }> {
	return typeof policy === 'object' && policy.kind === 'detail';
}

export function getActionResultMessage(
	result: ActionResult | null | undefined,
	fallbackMessage = '알 수 없는 오류가 발생했습니다.'
): string {
	if (!result) return '';

	if (result.type === 'failure') {
		return result.data?.message ?? fallbackMessage;
	}

	if (result.type === 'error') {
		return result.error?.message ?? fallbackMessage;
	}

	return '';
}
