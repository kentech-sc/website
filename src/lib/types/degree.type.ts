export const DEGREE_CATEGORIES = [
	'VC',
	'EF',
	'EL',
	'MN',
	'HASS',
	'ESP',
	'IR',
	'CAPS',
	'EN',
	'RC',
	'FR'
] as const;

export type DegreeCategory = (typeof DEGREE_CATEGORIES)[number];

export interface DegreeCourseInput {
	code: string;
	category: string | null;
	subcategory: string | null;
	level: number | null;
	credits: number;
	gradExcluded: boolean;
}

export interface DegreeCourseSequence {
	category: DegreeCategory;
	stages: string[][];
	waivedStagesByStartLevel?: Record<string, number>;
}

export interface GraduationPolicyRules {
	totalCredits: number;
	categoryRequirements: Record<DegreeCategory, number>;
	subcategoryRequirements: Array<{
		category: DegreeCategory;
		subcategory: string;
		minimumCredits: number;
	}>;
	levelRequirements: Array<{
		category: DegreeCategory;
		minimumLevel: number;
		minimumCredits: number;
	}>;
	courseCountAwards: Array<{
		category: DegreeCategory;
		minimumLevel: number;
		minimumCourses: number;
		awardedCredits: number;
		requiresCompletedSequence?: boolean;
	}>;
	subcategoryCaps: Array<{
		category: DegreeCategory;
		subcategory: string;
		maximumCredits: number;
	}>;
	courseSequences?: DegreeCourseSequence[];
}

export interface GraduationPolicy {
	id: string;
	name: string;
	admissionYearFrom: number;
	admissionYearTo: number;
	rules: GraduationPolicyRules;
}

export interface DegreeProgress {
	earned: Record<DegreeCategory, number> & { total: number };
	required: Record<DegreeCategory, number> & { total: number };
	efSub: { math: number; physics: number; chemistry: number; dataLiteracy: number };
	efSubRequired: { math: number; physics: number; chemistry: number; dataLiteracy: number };
	elUpperCredits: number;
	elUpperRequiredCredits: number;
	sequenceProgress: Array<{
		category: DegreeCategory;
		completedCount: number;
		waivedCount: number;
		totalCount: number;
		completedStageCount: number;
		totalStageCount: number;
		availableCourseIds: string[];
	}>;
}
