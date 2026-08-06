export type CourseSearchFilter =
	{ kind: 'all' } | { kind: 'slot'; weekday: number; minute: number } | { kind: 'unscheduled' };
