export interface GpaCourse {
	courseCode: string;
	credits: number;
	grade: string | null;
	year: number;
	term: number;
}

export interface GpaSummary {
	value: number;
	gradedCredits: number;
	qualityPoints: number;
	courseCount: number;
}

export interface TermGpaSummary extends GpaSummary {
	year: number;
	term: number;
}

const GRADE_POINTS: Record<string, number> = {
	'A+': 4.3,
	A0: 4,
	'A-': 3.7,
	'B+': 3.3,
	B0: 3,
	'B-': 2.7,
	'C+': 2.3,
	C0: 2,
	'C-': 1.7,
	'D+': 1.3,
	D0: 1,
	'D-': 0.7,
	F: 0
};

const TERM_ORDER: Record<number, number> = { 1: 1, 3: 2, 2: 3, 4: 4 };

function normalizeGrade(grade: string | null): string | null {
	if (!grade) return null;
	const normalized = grade.trim().toUpperCase().replace('−', '-');
	if (/^[ABCD]$/.test(normalized)) return `${normalized}0`;
	return normalized;
}

function periodOrder(course: Pick<GpaCourse, 'year' | 'term'>): number {
	return course.year * 10 + (TERM_ORDER[course.term] ?? course.term);
}

/** KENTECH 4.3 scale. S/U, I, W and missing grades do not affect GPA. */
export function calculateGpa(courses: GpaCourse[]): GpaSummary | null {
	const latestGradedByCourse = new Map<string, GpaCourse & { gradePoint: number }>();
	for (const course of courses) {
		const grade = normalizeGrade(course.grade);
		if (grade === null || !(grade in GRADE_POINTS) || course.credits <= 0) continue;
		const candidate = { ...course, gradePoint: GRADE_POINTS[grade] };
		const current = latestGradedByCourse.get(course.courseCode);
		if (!current || periodOrder(candidate) >= periodOrder(current))
			latestGradedByCourse.set(course.courseCode, candidate);
	}

	const graded = [...latestGradedByCourse.values()];
	const gradedCredits = graded.reduce((sum, course) => sum + course.credits, 0);
	if (gradedCredits <= 0) return null;
	const qualityPoints = graded.reduce((sum, course) => sum + course.gradePoint * course.credits, 0);
	return {
		value: qualityPoints / gradedCredits,
		gradedCredits,
		qualityPoints,
		courseCount: graded.length
	};
}

/** Semester GPA keeps each term's original result even when a course is retaken later. */
export function calculateTermGpas(courses: GpaCourse[]): TermGpaSummary[] {
	const groups = new Map<string, GpaCourse[]>();
	for (const course of courses) {
		const key = `${course.year}:${course.term}`;
		groups.set(key, [...(groups.get(key) ?? []), course]);
	}
	return [...groups.values()]
		.flatMap((termCourses) => {
			const summary = calculateGpa(termCourses);
			const first = termCourses[0];
			return summary && first ? [{ ...summary, year: first.year, term: first.term }] : [];
		})
		.sort((a, b) => periodOrder(b) - periodOrder(a));
}
