export type CourseId = string;

export interface CourseEntity {
	id: CourseId;
	name: string;
	credits: number;
	creditType: 'numeric' | 'pass';
}

export type Course = CourseEntity;

export interface CatalogCourseCreate extends CourseEntity {
	category: string | null;
	subcategory: string | null;
	level: number | null;
	gradExcluded: boolean;
}
