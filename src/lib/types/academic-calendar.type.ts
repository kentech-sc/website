/** 학교 포털 학사일정 한 건. 하루짜리면 startDay 와 endDay 가 같다. */
export interface ScheduleEntry {
	/** YYYY-MM-DD */
	startDay: string;
	/** YYYY-MM-DD */
	endDay: string;
	subject: string;
}

export interface AcademicSchedule {
	/** 실제 오늘. 서버(KST)에서 정해 내려주며 오늘 강조에만 쓴다. YYYY-MM-DD */
	today: string;
	/** 화면이 보여주는 기준일. 사용자가 달을 옮기면 여기만 바뀐다. YYYY-MM-DD */
	anchor: string;
	entries: ScheduleEntry[];
}
