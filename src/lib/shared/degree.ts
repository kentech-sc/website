import type {
	DegreeCategory,
	DegreeCourseInput,
	DegreeCourseSequence,
	DegreeProgress,
	GraduationPolicyRules
} from '$lib/types/degree.type.js';

// Compatibility fallback for catalog rows created before category metadata existed.
// New and imported courses use category/subcategory/level from the database.
const PREFIX_CATEGORY: Record<string, DegreeCategory> = {
	VC: 'VC',
	EF: 'EF',
	EL: 'EL',
	MN: 'MN',
	HA: 'HASS',
	ES: 'ESP',
	IR: 'IR',
	CA: 'CAPS',
	EN: 'EN',
	RC: 'RC',
	FR: 'FR',
	EE: 'FR',
	GS: 'EL'
};

function categoryOf(course: DegreeCourseInput): DegreeCategory | null {
	if (course.category && (Object.values(PREFIX_CATEGORY) as string[]).includes(course.category))
		return course.category as DegreeCategory;
	const prefix = course.code.match(/^[A-Z]+/)?.[0] ?? '';
	for (let length = prefix.length; length > 0; length -= 1) {
		const category = PREFIX_CATEGORY[prefix.slice(0, length)];
		if (category) return category;
	}
	return null;
}

function nestedCredits(
	credits: Map<DegreeCategory, Map<string, number>>,
	category: DegreeCategory,
	subcategory: string
) {
	return credits.get(category)?.get(subcategory) ?? 0;
}

export function getCourseSequenceProgress(
	sequence: DegreeCourseSequence,
	completedCourseIds: Iterable<string>,
	waivedCourseIds: Iterable<string> = []
) {
	const completedCodes = new Set(completedCourseIds);
	const sequenceCourseIds = new Set(sequence.stages.flat());
	const waivedCodes = new Set(
		[...waivedCourseIds].filter((courseId) => sequenceCourseIds.has(courseId))
	);
	let completedStageCount = 0;
	let completedCount = 0;
	let availableCourseIds: string[] = [];

	for (let index = 0; index < sequence.stages.length; index += 1) {
		const stage = sequence.stages[index];
		const completedInStage = stage.filter(
			(courseId) => completedCodes.has(courseId) || waivedCodes.has(courseId)
		);
		completedCount += completedInStage.length;
		if (completedInStage.length === stage.length) {
			completedStageCount += 1;
			continue;
		}
		availableCourseIds = stage.filter(
			(courseId) => !completedCodes.has(courseId) && !waivedCodes.has(courseId)
		);
		break;
	}

	return {
		category: sequence.category,
		completedCount,
		waivedCount: waivedCodes.size,
		totalCount: sequence.stages.reduce((count, stage) => count + stage.length, 0),
		completedStageCount,
		totalStageCount: sequence.stages.length,
		availableCourseIds
	};
}

export function calculateDegreeProgress(
	courses: DegreeCourseInput[],
	policy: GraduationPolicyRules,
	waivedCourseIds: Partial<Record<DegreeCategory, string[]>> = {}
): DegreeProgress {
	const categories = Object.keys(policy.categoryRequirements) as DegreeCategory[];
	const earned = Object.fromEntries(
		[...categories, 'total'].map((key) => [key, 0])
	) as DegreeProgress['earned'];
	const subcategoryCredits = new Map<DegreeCategory, Map<string, number>>();
	const levelCredits = new Map<DegreeCategory, Map<number, number>>();
	const categoryCourseLevels = new Map<DegreeCategory, number[]>();
	const seen = new Set<string>();

	for (const course of courses) {
		if (seen.has(course.code) || course.gradExcluded) continue;
		seen.add(course.code);
		const category = categoryOf(course);
		if (!category || !(category in policy.categoryRequirements)) continue;
		const credits = Number(course.credits) || 0;
		earned[category] += credits;

		if (course.subcategory) {
			const values = subcategoryCredits.get(category) ?? new Map<string, number>();
			values.set(course.subcategory, (values.get(course.subcategory) ?? 0) + credits);
			subcategoryCredits.set(category, values);
		}
		if (course.level !== null) {
			const values = levelCredits.get(category) ?? new Map<number, number>();
			values.set(course.level, (values.get(course.level) ?? 0) + credits);
			levelCredits.set(category, values);
			categoryCourseLevels.set(category, [
				...(categoryCourseLevels.get(category) ?? []),
				course.level
			]);
		}
	}

	for (const cap of policy.subcategoryCaps) {
		const credits = nestedCredits(subcategoryCredits, cap.category, cap.subcategory);
		if (credits > cap.maximumCredits) earned[cap.category] -= credits - cap.maximumCredits;
	}

	const completedCodes = new Set(courses.map((course) => course.code));
	const sequenceProgressWithNext = (policy.courseSequences ?? []).map((sequence) =>
		getCourseSequenceProgress(sequence, completedCodes, waivedCourseIds[sequence.category] ?? [])
	);

	for (const award of policy.courseCountAwards) {
		const count = (categoryCourseLevels.get(award.category) ?? []).filter(
			(level) => level >= award.minimumLevel
		).length;
		const requiredSequence = sequenceProgressWithNext.find(
			(sequence) => sequence.category === award.category
		);
		const sequenceCompleted =
			!award.requiresCompletedSequence ||
			(requiredSequence !== undefined &&
				requiredSequence.completedStageCount === requiredSequence.totalStageCount);
		if (count >= award.minimumCourses && sequenceCompleted)
			earned[award.category] += award.awardedCredits;
	}

	for (const category of categories.filter((category) => category !== 'FR')) {
		const required = policy.categoryRequirements[category];
		if (earned[category] > required) earned.FR += earned[category] - required;
	}
	earned.total = categories.reduce(
		(sum, category) => sum + Math.min(earned[category], policy.categoryRequirements[category]),
		0
	);

	const efRequirement = (subcategory: string) =>
		policy.subcategoryRequirements.find(
			(requirement) => requirement.category === 'EF' && requirement.subcategory === subcategory
		)?.minimumCredits ?? 0;
	const elUpperRequirement = policy.levelRequirements.find(
		(requirement) => requirement.category === 'EL'
	);
	const elUpperCredits = elUpperRequirement
		? [...(levelCredits.get('EL') ?? new Map()).entries()]
				.filter(([level]) => level >= elUpperRequirement.minimumLevel)
				.reduce((sum, [, credits]) => sum + credits, 0)
		: 0;
	const sequenceProgress = sequenceProgressWithNext;

	return {
		earned,
		required: { ...policy.categoryRequirements, total: policy.totalCredits },
		efSub: {
			math: nestedCredits(subcategoryCredits, 'EF', 'math'),
			physics: nestedCredits(subcategoryCredits, 'EF', 'physics'),
			chemistry: nestedCredits(subcategoryCredits, 'EF', 'chemistry'),
			dataLiteracy: nestedCredits(subcategoryCredits, 'EF', 'data_literacy')
		},
		efSubRequired: {
			math: efRequirement('math'),
			physics: efRequirement('physics'),
			chemistry: efRequirement('chemistry'),
			dataLiteracy: efRequirement('data_literacy')
		},
		elUpperCredits,
		elUpperRequiredCredits: elUpperRequirement?.minimumCredits ?? 0,
		sequenceProgress
	};
}

export function hasMeetingConflict(
	a: { weekday: number; startsAt: number; endsAt: number },
	b: { weekday: number; startsAt: number; endsAt: number }
): boolean {
	return a.weekday === b.weekday && a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}
