import { sql } from 'drizzle-orm';
import { customType, pgSchema } from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');
export const identitySchema = pgSchema('private');
export const communitySchema = pgSchema('community');
export const academicSchema = pgSchema('academic');
export const pointsSchema = pgSchema('points');

export const isoTimestamp = customType<{ data: string; driverData: string }>({
	dataType: () => 'timestamp with time zone',
	fromDriver: (value) => new Date(value).toISOString(),
	toDriver: (value) => value
});

export const timestamps = {
	createdAt: isoTimestamp('created_at')
		.default(sql`now()`)
		.notNull(),
	updatedAt: isoTimestamp('updated_at')
		.default(sql`now()`)
		.notNull()
};
