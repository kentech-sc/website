export const BoardId = {
	Notice: 'notice',
	Free: 'free'
} as const;

export type BoardId = (typeof BoardId)[keyof typeof BoardId];
