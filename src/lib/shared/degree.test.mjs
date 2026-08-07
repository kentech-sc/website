import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCompletionStatus } from './completion-status.js';
import {
	calculateDegreeProgress,
	getCourseSequenceProgress,
	hasMeetingConflict
} from './degree.ts';

const categoryRequirements = {
	VC: 8,
	EF: 28,
	EL: 40,
	MN: 16,
	HASS: 4,
	ESP: 4,
	IR: 4,
	CAPS: 4,
	EN: 4,
	RC: 4,
	FR: 12
};

function policy(mathCredits = 4) {
	return {
		totalCredits: 128,
		categoryRequirements,
		subcategoryRequirements: [
			{ category: 'EF', subcategory: 'math', minimumCredits: mathCredits },
			{ category: 'EF', subcategory: 'physics', minimumCredits: 4 },
			{ category: 'EF', subcategory: 'chemistry', minimumCredits: 4 },
			{ category: 'EF', subcategory: 'data_literacy', minimumCredits: 4 }
		],
		levelRequirements: [{ category: 'EL', minimumLevel: 4, minimumCredits: 8 }],
		courseCountAwards: [
			{
				category: 'ESP',
				minimumLevel: 3,
				minimumCourses: 2,
				awardedCredits: 4,
				requiresCompletedSequence: true
			}
		],
		subcategoryCaps: [{ category: 'EF', subcategory: 'ap', maximumCredits: 4 }],
		courseSequences: [
			{
				category: 'ESP',
				stages: [['ES1001'], ['ES1002'], ['ES2001', 'ES2002'], ['ES3001', 'ES3002']],
				waivedStagesByStartLevel: { 1: 0, 2: 1, 3: 2 }
			}
		]
	};
}

const course = (code, category, credits, extra = {}) => ({
	code,
	category,
	subcategory: null,
	level: null,
	credits,
	gradExcluded: false,
	...extra
});

test('cohort policy controls EF math requirements without course-code logic', () => {
	const result = calculateDegreeProgress(
		[
			course('EF1001', 'EF', 4, { subcategory: 'math' }),
			course('EF1008', 'EF', 4, { subcategory: 'math' })
		],
		policy(8)
	);
	assert.equal(result.efSub.math, 8);
	assert.equal(result.efSubRequired.math, 8);
});

test('duplicate and explicitly excluded courses do not add graduation credit', () => {
	const result = calculateDegreeProgress(
		[
			course('HA1001', 'HASS', 4),
			course('HA1001', 'HASS', 4),
			course('GR1001', 'FR', 10, { gradExcluded: true })
		],
		policy()
	);
	assert.equal(result.earned.HASS, 4);
	assert.equal(result.earned.FR, 0);
});

test('upper-level EL requirement is credit based', () => {
	const result = calculateDegreeProgress(
		[course('EL4001', 'EL', 4, { level: 4 }), course('EL5001', 'EL', 4, { level: 5 })],
		policy()
	);
	assert.equal(result.elUpperCredits, 8);
});

test('AP credits are capped through metadata policy', () => {
	const result = calculateDegreeProgress(
		[course('A123456', 'EF', 8, { subcategory: 'ap' })],
		policy()
	);
	assert.equal(result.earned.EF, 4);
});

test('ESP awards four credits only after every required stage is complete', () => {
	const incomplete = calculateDegreeProgress(
		[course('ES3001', 'ESP', 0, { level: 3 }), course('ES3002', 'ESP', 0, { level: 3 })],
		policy()
	);
	const completed = calculateDegreeProgress(
		[
			...['ES1001', 'ES1002', 'ES2001', 'ES2002'].map((code) =>
				course(code, 'ESP', 0, { level: Number(code[2]) })
			),
			course('ES3001', 'ESP', 0, { level: 3 }),
			course('ES3002', 'ESP', 0, { level: 3 })
		],
		policy()
	);
	assert.equal(incomplete.earned.ESP, 0);
	assert.equal(completed.earned.ESP, 4);
});

test('ESP waiver supports an individually skipped course inside a stage', () => {
	const partialIntermediateWaiver = calculateDegreeProgress([], policy(), {
		ESP: ['ES1001', 'ES1002', 'ES2001']
	});
	assert.deepEqual(partialIntermediateWaiver.sequenceProgress[0], {
		category: 'ESP',
		completedCount: 3,
		waivedCount: 3,
		totalCount: 6,
		completedStageCount: 2,
		totalStageCount: 4,
		availableCourseIds: ['ES2002']
	});
	assert.equal(partialIntermediateWaiver.earned.ESP, 0);
});

test('ESP sequence allows both courses in the current speaking and writing stage', () => {
	const sequence = policy().courseSequences[0];
	const foundationOneWaived = ['ES1001'];
	assert.deepEqual(
		getCourseSequenceProgress(sequence, [], foundationOneWaived).availableCourseIds,
		['ES1002']
	);
	assert.deepEqual(
		getCourseSequenceProgress(sequence, ['ES1002'], foundationOneWaived).availableCourseIds,
		['ES2001', 'ES2002']
	);
	assert.deepEqual(
		getCourseSequenceProgress(sequence, ['ES1002', 'ES2002'], foundationOneWaived)
			.availableCourseIds,
		['ES2001']
	);
	assert.deepEqual(
		getCourseSequenceProgress(sequence, ['ES1002', 'ES2001', 'ES2002'], foundationOneWaived)
			.availableCourseIds,
		['ES3001', 'ES3002']
	);
});

test('ESP sequence does not accept a later stage completed out of order', () => {
	const progress = getCourseSequenceProgress(policy().courseSequences[0], ['ES3001', 'ES3002']);
	assert.equal(progress.completedCount, 0);
	assert.equal(progress.completedStageCount, 0);
	assert.deepEqual(progress.availableCourseIds, ['ES1001']);
});

test('ESP waived foundation students still complete intermediate before advanced certification', () => {
	const incomplete = calculateDegreeProgress(
		[course('ES3001', 'ESP', 0, { level: 3 }), course('ES3002', 'ESP', 0, { level: 3 })],
		policy(),
		{ ESP: ['ES1001', 'ES1002'] }
	);
	const completed = calculateDegreeProgress(
		[
			course('ES2001', 'ESP', 0, { level: 2 }),
			course('ES2002', 'ESP', 0, { level: 2 }),
			course('ES3001', 'ESP', 0, { level: 3 }),
			course('ES3002', 'ESP', 0, { level: 3 })
		],
		policy(),
		{ ESP: ['ES1001', 'ES1002'] }
	);
	assert.equal(incomplete.earned.ESP, 0);
	assert.equal(completed.earned.ESP, 4);
});

test('failed and withdrawn grade codes override a selected passed status', () => {
	assert.equal(resolveCompletionStatus('F', 'passed'), 'failed');
	assert.equal(resolveCompletionStatus('u', 'passed'), 'failed');
	assert.equal(resolveCompletionStatus('W', 'passed'), 'withdrawn');
	assert.equal(resolveCompletionStatus(null, 'failed'), 'failed');
});

test('meeting conflict uses half-open time ranges', () => {
	assert.equal(
		hasMeetingConflict(
			{ weekday: 1, startsAt: 600, endsAt: 660 },
			{ weekday: 1, startsAt: 650, endsAt: 700 }
		),
		true
	);
	assert.equal(
		hasMeetingConflict(
			{ weekday: 1, startsAt: 600, endsAt: 660 },
			{ weekday: 1, startsAt: 660, endsAt: 700 }
		),
		false
	);
});

test('free elective credit is capped once in total progress', () => {
	const result = calculateDegreeProgress([course('FR1001', 'FR', 16)], policy());
	assert.equal(result.earned.FR, 16);
	assert.equal(result.earned.total, 12);
});
