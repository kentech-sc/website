import type { AcademicSchedule } from '$lib/types/academic-calendar.type.js';

/**
 * 달력 두 안(격자/목록)이 공유하는 이동 상태.
 * 서버가 내려준 일정을 기본으로 쓰고, 사용자가 기준일을 옮기면 그 결과로 덮는다.
 */
export class CalendarNav {
	// 서버 데이터는 값이 아니라 getter 로 받는다. 값으로 받으면 처음 것만 붙잡혀
	// 페이지가 다시 불러와졌을 때 갱신되지 않는다.
	#getInitial: () => AcademicSchedule | null;
	#moved = $state<AcademicSchedule | null>(null);

	loading = $state(false);
	errorMessage = $state<string | null>(null);

	constructor(getInitial: () => AcademicSchedule | null) {
		this.#getInitial = getInitial;
	}

	get schedule(): AcademicSchedule | null {
		return this.#moved ?? this.#getInitial();
	}

	/** @param dayKey 옮겨갈 기준일 YYYY-MM-DD */
	async moveTo(dayKey: string) {
		if (this.loading) return;

		this.loading = true;
		this.errorMessage = null;

		try {
			const response = await fetch(`/api/academic-calendar?date=${dayKey}`);
			const body = await response.json();

			if (!response.ok) {
				this.errorMessage = body.message ?? '학사일정을 불러오지 못했습니다.';
				return;
			}

			this.#moved = body as AcademicSchedule;
		} catch {
			this.errorMessage = '학사일정을 불러오지 못했습니다.';
		} finally {
			this.loading = false;
		}
	}
}
