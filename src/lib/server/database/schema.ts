import {
	courseMeetings,
	courseOfferingProfessors,
	courseOfferings,
	courseRecords,
	courses,
	graduationPolicies,
	professors,
	reviews,
	studentAcademicProfiles,
	timetableItems,
	timetables
} from './academic.schema.js';
import {
	activityLogs,
	banners,
	fileMetas,
	meetupResponses,
	meetups,
	pushSubscriptions,
	throttles
} from './app.schema.js';
import {
	anonymousReports,
	comments,
	postFiles,
	postLikes,
	posts,
	submissionFiles,
	submissionSupports,
	submissions
} from './community.schema.js';
import { gameRecords, gameSessions } from './game.schema.js';
import { pointAccounts, pointDailyEventCounts, pointLedgerEntries } from './points.schema.js';
import { userIdentities, userProfiles, users } from './user.schema.js';

export * from './academic.schema.js';
export * from './app.schema.js';
export * from './community.schema.js';
export * from './game.schema.js';
export * from './points.schema.js';
export * from './schema-core.js';
export * from './user.schema.js';

// Server authorization is the source of truth. RLS remains a deny-by-default guard.
[
	users,
	userProfiles,
	userIdentities,
	courses,
	professors,
	courseOfferings,
	courseOfferingProfessors,
	courseMeetings,
	studentAcademicProfiles,
	graduationPolicies,
	courseRecords,
	timetables,
	timetableItems,
	posts,
	postLikes,
	comments,
	submissions,
	submissionSupports,
	anonymousReports,
	reviews,
	fileMetas,
	banners,
	postFiles,
	submissionFiles,
	pointAccounts,
	pointLedgerEntries,
	pointDailyEventCounts,
	throttles,
	pushSubscriptions,
	meetups,
	meetupResponses,
	activityLogs,
	gameRecords,
	gameSessions
].forEach((table) => table.enableRLS());
