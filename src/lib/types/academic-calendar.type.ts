/** 학교 포털 학사일정 한 건. 하루짜리면 startDay 와 endDay 가 같다. */
export interface ScheduleEntry {
	/** YYYY-MM-DD */
	startDay: string;
	/** YYYY-MM-DD */
	endDay: string;
	subject: string;
}

export interface AcademicSchedule {
	/** 화면이 기준으로 삼을 오늘. 서버(KST)에서 정해 내려준다. YYYY-MM-DD */
	today: string;
	entries: ScheduleEntry[];
}
