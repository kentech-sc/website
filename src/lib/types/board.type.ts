export const BoardId = {
	Notice: 'notice',
	Free: 'free',
	Bylaw: 'bylaw'
} as const;

export type BoardId = (typeof BoardId)[keyof typeof BoardId];
