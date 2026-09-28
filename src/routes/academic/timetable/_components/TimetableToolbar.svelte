<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import Trash from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

	import TimetableName from './TimetableName.svelte';

	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';

	let {
		actualSelected,
		selected,
		courseCount,
		totalCredits,
		totalHours,
		archivedCourseCount,
		conflictCount,
		savingImage,
		editingName = $bindable(false),
		renameError,
		onCancelRename,
		onDownload,
		pendingEnhance,
		renameEnhance,
		deleteEnhance
	}: {
		actualSelected: boolean;
		selected: PageData['timetables'][number] | null;
		courseCount: number;
		totalCredits: number;
		totalHours: number;
		archivedCourseCount: number;
		conflictCount: number;
		savingImage: boolean;
		editingName?: boolean;
		renameError: string;
		onCancelRename: () => void;
		onDownload: () => void | Promise<void>;
		pendingEnhance: SubmitFunction;
		renameEnhance: SubmitFunction;
		deleteEnhance: SubmitFunction;
	} = $props();

	const formattedHours = $derived(
		Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)
	);
</script>

<section class="module timetable-toolbar" class:is-actual={actualSelected}>
	<div class="timetable-title">
		<TimetableName
			{actualSelected}
			{selected}
			bind:editingName
			{renameError}
			{onCancelRename}
			{renameEnhance}
		/>
	</div>

	<div class="timetable-stats">
		<span><b>{courseCount}</b>과목</span>
		<span><b>{totalCredits}</b>{actualSelected ? '인정학점' : '학점'}</span>
		<span><b>{formattedHours}</b>시간/주</span>
	</div>

	{#if selected && !actualSelected}
		<div class="timetable-actions">
			<form
				method="POST"
				action={selected.isConfirmed ? '?/unconfirm' : '?/confirm'}
				use:enhance={pendingEnhance}
			>
				<input type="hidden" name="timetableId" value={selected.id} />
				<button
					class="ui-button is-compact"
					class:is-primary={!selected.isConfirmed}
					class:is-danger={selected.isConfirmed}
					disabled={!selected.isConfirmed &&
						(!courseCount || archivedCourseCount > 0 || conflictCount > 0)}
					title={archivedCourseCount
						? '폐강된 강의를 제거한 뒤 확정할 수 있습니다.'
						: conflictCount
							? '겹치는 강의를 조정한 뒤 확정할 수 있습니다.'
							: undefined}
				>
					{#if selected.isConfirmed}<X size="0.9rem" />확정 취소{:else}<Check
							size="0.9rem"
						/>확정{/if}
				</button>
			</form>
			<div class="timetable-utilities">
				<button
					type="button"
					class="ui-button is-icon"
					disabled={savingImage || !selected.offerings.length}
					onclick={onDownload}
					aria-label="시간표 이미지 저장"
					title="이미지로 저장/공유"><ImageDown size="0.9rem" /></button
				>
				<form method="POST" action="?/copy" use:enhance={pendingEnhance}>
					<input type="hidden" name="timetableId" value={selected.id} />
					<button class="ui-button is-icon" aria-label="시간표 복제" title="시간표 복제">
						<Copy size="0.9rem" />
					</button>
				</form>
				<form method="POST" action="?/delete" use:enhance={deleteEnhance}>
					<input type="hidden" name="timetableId" value={selected.id} />
					<button class="ui-button is-icon is-danger" aria-label="시간표 삭제" title="시간표 삭제">
						<Trash size="0.9rem" />
					</button>
				</form>
			</div>
		</div>
	{/if}
</section>

<style lang="scss">
	.timetable-toolbar,
	.timetable-title,
	.timetable-stats,
	.timetable-actions,
	.timetable-utilities,
	.timetable-actions button {
		display: flex;
		align-items: center;
	}
	.timetable-toolbar {
		gap: 0.8rem;
		padding: 0.6rem 1rem;
	}
	.timetable-title {
		flex: 1;
		gap: 0.4rem;
		min-width: 13rem;
	}
	.timetable-stats {
		gap: 0.6rem;
		color: var(--gray-text);
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.timetable-stats span + span {
		border-left: var(--divider-border-width) solid var(--gray-border);
		padding-left: 0.6rem;
	}
	.timetable-stats b {
		margin-right: 0.2rem;
		color: var(--text);
		font-size: 0.9rem;
	}
	.timetable-actions {
		gap: 0.4rem;
	}
	.timetable-utilities {
		gap: 0.2rem;
		border-left: var(--divider-border-width) solid var(--gray-border);
		padding-left: 0.4rem;
	}
	@media (width <= 760px) {
		.timetable-toolbar {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			gap: 0.6rem 0.8rem;
		}
		.timetable-title {
			grid-row: 1;
			grid-column: 1 / -1;
			min-width: 0;
		}
		.timetable-stats {
			grid-row: 2;
			grid-column: 1;
			justify-content: flex-start;
			overflow-x: auto;
		}
		.timetable-actions {
			grid-row: 2;
			grid-column: 2;
			justify-content: flex-end;
		}
		.timetable-toolbar.is-actual .timetable-stats {
			grid-column: 1 / -1;
		}
	}
	@media (width <= 480px) {
		.timetable-stats {
			grid-column: 1 / -1;
		}
		.timetable-actions {
			grid-row: 3;
			grid-column: 1 / -1;
			justify-content: space-between;
		}
		.timetable-actions > form {
			flex: 1;
		}
		.timetable-actions > form > button {
			justify-content: center;
			width: 100%;
		}
	}
</style>
