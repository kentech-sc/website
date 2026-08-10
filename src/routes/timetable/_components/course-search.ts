export type CourseSearchFilter =
	| { kind: 'all' }
	| { kind: 'day'; weekday: number }
	| { kind: 'slot'; weekday: number; minute: number }
	| { kind: 'unscheduled' };
