export function asEntity<T>(value: unknown): T {
	return value as T;
}

export function firstOrNull<T>(values: T[]): T | null {
	return values[0] ?? null;
}
