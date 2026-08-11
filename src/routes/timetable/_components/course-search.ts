export type CourseSearchFilter =
	| { kind: 'all' }
	| { kind: 'day'; weekday: number }
	| { kind: 'slot'; weekday: number; minute: number }
	| {
			kind: 'replace';
			sourceOfferingId: string;
			weekday: number;
			startsAt: number;
			endsAt: number;
	  }
	| { kind: 'unscheduled' };
