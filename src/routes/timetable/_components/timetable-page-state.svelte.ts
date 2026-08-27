import { overlapsTimeRange } from './course-search.js';
import { downloadScheduleElementAsPng } from './schedule-image.js';

import type { CourseSearchFilter, TimeBlock } from './course-search.js';
import type { PageData } from '../$types.js';
import type { SubmitFunction } from '@sveltejs/kit';

import { navigating } from '$app/state';

type Offering = PageData['offerings'][number];
type Meeting = Offering['meetings'][number];

export class TimetablePageState {
	readonly actualId = 'actual';
	readonly weekdays = ['월', '화', '수', '목', '금'];

	selectedId = $state<string | null>(null);
	editingName = $state(false);
	renameError = $state('');
	submitting = $state(false);
	savingImage = $state(false);
	searchFilter = $state<CourseSearchFilter | null>(null);
	searchSession = $state(0);
	schedulePanel = $state<HTMLElement | null>(null);

	constructor(private readonly getData: () => PageData) {}

	get data() {
		return this.getData();
	}
	get selected() {
		return this.data.timetables.find((item) => item.id === this.selectedId) ?? null;
	}
	get actualSelected() {
		return this.selectedId === this.actualId && this.data.actualSchedule.completions.length > 0;
	}
	get displayOfferings(): Offering[] {
		return this.actualSelected
			? this.data.actualSchedule.offerings
			: (this.selected?.offerings ?? []);
	}
	get archivedOfferings() {
		return this.selected?.offerings.filter((offering) => offering.archivedAt !== null) ?? [];
	}
	get activeDisplayOfferings() {
		return this.actualSelected
			? this.displayOfferings
			: this.displayOfferings.filter((offering) => offering.archivedAt === null);
	}
	get hiddenSelectedOfferings() {
		return (
			this.selected?.offerings.filter(
				(offering) =>
					!offering.meetings.some((meeting) => meeting.weekday >= 1 && meeting.weekday <= 5)
			) ?? []
		);
	}
	get busy() {
		return this.submitting || navigating.to !== null;
	}
	get progress() {
		if (this.actualSelected) return this.data.degreeProgress;
		if (this.selected) return this.data.timetableProgress[this.selected.id];
		return this.data.degreeProgress;
	}
	get totalCredits() {
		return this.actualSelected
			? this.data.actualSchedule.completions
					.filter((completion) => completion.status === 'passed')
					.reduce((sum, completion) => sum + completion.credits, 0)
			: this.activeDisplayOfferings.reduce((sum, offering) => sum + offering.credits, 0);
	}
	get totalHours() {
		return (
			this.activeDisplayOfferings.reduce(
				(sum, offering) =>
					sum +
					offering.meetings.reduce(
						(meetingSum, meeting) => meetingSum + meeting.endsAt - meeting.startsAt,
						0
					),
				0
			) / 60
		);
	}

	ensureValidSelection = () => {
		const validSelection =
			(this.selectedId === this.actualId && this.data.actualSchedule.completions.length > 0) ||
			this.data.timetables.some((item) => item.id === this.selectedId);
		if (!validSelection) {
			this.selectedId = this.data.actualSchedule.completions.length
				? this.actualId
				: (this.data.timetables[0]?.id ?? null);
		}
	};

	selectTimetable = (id: string) => {
		this.selectedId = id;
		this.editingName = false;
		this.renameError = '';
	};
	cancelRename = () => {
		this.editingName = false;
		this.renameError = '';
	};

	private openSearch = (filter: CourseSearchFilter) => {
		if (!this.selected || this.busy) return;
		this.searchFilter = filter;
		this.searchSession += 1;
	};

	openSlotPicker = (weekday: number, block: TimeBlock) => {
		this.openSearch({ kind: 'slot', weekday, startsAt: block.startsAt, endsAt: block.endsAt });
	};

	openReplacementPicker = (offeringId: string, meeting: Meeting) => {
		this.openSearch({
			kind: 'replace',
			sourceOfferingId: offeringId,
			meetingId: meeting.id,
			weekday: meeting.weekday,
			startsAt: meeting.startsAt,
			endsAt: meeting.endsAt
		});
	};

	openCourseBrowser = () => this.openSearch({ kind: 'all' });
	openUnscheduledBrowser = () => this.openSearch({ kind: 'unscheduled' });
	closeCourseBrowser = () => (this.searchFilter = null);
	clearCourseSearchFilter = () => {
		if (this.searchFilter) this.searchFilter = { kind: 'all' };
	};

	downloadSelectedSchedule = async () => {
		if (!this.schedulePanel || this.savingImage) return;
		this.savingImage = true;
		try {
			const filename = `${this.actualSelected ? '실제 수강' : (this.selected?.name ?? '시간표')}.png`;
			await downloadScheduleElementAsPng(this.schedulePanel, filename);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.error('시간표 이미지 저장 오류:', error);
			alert(error instanceof Error ? error.message : '이미지를 저장하지 못했습니다.');
		} finally {
			this.savingImage = false;
		}
	};

	pendingEnhance: SubmitFunction = () => {
		this.submitting = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				this.submitting = false;
			}
		};
	};

	replaceEnhance: SubmitFunction = ({ formData }) => {
		const targetOfferingId = String(formData.get('toOfferingId'));
		const previousFilter = this.searchFilter?.kind === 'replace' ? this.searchFilter : null;
		this.submitting = true;
		return async ({ result, update }) => {
			let nextSelection: [string, Meeting] | null = null;
			let shouldClose = false;
			try {
				await update();
				if (result.type === 'success' && previousFilter) {
					const target = this.data.offerings.find((offering) => offering.id === targetOfferingId);
					const meeting =
						target?.meetings.find((item) => overlapsTimeRange(item, previousFilter)) ??
						target?.meetings.find((item) => item.weekday >= 1 && item.weekday <= 5);
					if (target && meeting) nextSelection = [target.id, meeting];
					else shouldClose = true;
				}
			} finally {
				this.submitting = false;
			}
			if (nextSelection) this.openReplacementPicker(...nextSelection);
			else if (shouldClose) this.closeCourseBrowser();
		};
	};

	removeOfferingEnhance: SubmitFunction = ({ formData }) => {
		const removedOfferingId = String(formData.get('offeringId'));
		this.submitting = true;
		return async ({ result, update }) => {
			try {
				await update();
				if (
					result.type === 'success' &&
					this.searchFilter?.kind === 'replace' &&
					this.searchFilter.sourceOfferingId === removedOfferingId
				)
					this.closeCourseBrowser();
			} finally {
				this.submitting = false;
			}
		};
	};

	deleteEnhance: SubmitFunction = (input) => {
		if (!confirm('이 시간표를 삭제할까요?')) {
			input.cancel();
			return;
		}
		return this.pendingEnhance(input);
	};

	renameEnhance: SubmitFunction = () => {
		this.renameError = '';
		this.submitting = true;
		return async ({ result, update }) => {
			try {
				if (result.type === 'failure') {
					this.renameError = String(result.data?.message ?? '시간표 이름을 저장하지 못했습니다.');
					await update({ reset: false });
					return;
				}
				this.editingName = false;
				await update();
			} finally {
				this.submitting = false;
			}
		};
	};
}
