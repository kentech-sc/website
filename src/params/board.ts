import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is ('free' | 'notice') => {
	return param === 'free' || param === 'notice';
}) satisfies ParamMatcher;