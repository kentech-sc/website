<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';
	import Copy from '@lucide/svelte/icons/copy';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

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
		{#if actualSelected}
			<h2>실제 수강</h2>
			<span class="status-badge actual-badge"><CheckCircle size="0.8rem" />수강 기록</span>
		{:else if selected}
			{#if editingName}
				<form method="POST" action="?/rename" use:enhance={renameEnhance}>
					<input type="hidden" name="timetableId" value={selected.id} />
					<input name="name" value={selected.name} aria-label="시간표 이름" />
					<button>저장</button>
					<button type="button" onclick={onCancelRename}>취소</button>
					{#if renameError}<p class="rename-error" aria-live="polite">{renameError}</p>{/if}
				</form>
			{:else}
				<h2>{selected.name}</h2>
				<button
					class="ui-button is-icon edit-name"
					type="button"
					onclick={() => (editingName = true)}
					aria-label="시간표 이름 변경"
					title="이름 변경"><Pencil size="0.8rem" /></button
				>
			{/if}
			{#if selected.isConfirmed}
				<span class="status-badge confirmed-badge"><CheckCircle size="0.8rem" />확정</span>
			{/if}
		{/if}
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
	.timetable-title form,
	.timetable-stats,
	.timetable-actions,
	.timetable-utilities,
	.timetable-actions button,
	.confirmed-badge,
	.actual-badge {
		display: flex;
		align-items: center;
	}
	.timetable-toolbar {
		justify-content: space-between;
		gap: 0.8rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.8rem;
		background: var(--white);
		padding: 0.6rem;
	}
	.timetable-title {
		flex: 1;
		gap: 0.4rem;
		min-width: 13rem;
	}
	.timetable-title h2 {
		margin: 0;
		font-size: 0.9rem;
	}
	.timetable-title form {
		flex: 1;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.timetable-title input {
		min-width: 7rem;
		max-width: 13rem;
	}
	.rename-error {
		flex-basis: 100%;
		margin: 0;
		color: var(--error-text);
		font-size: 0.7rem;
	}
	.edit-name {
		padding: 0.2rem;
		color: var(--gray-text);
	}
	.confirmed-badge,
	.actual-badge {
		flex-shrink: 0;
		font-size: 0.6rem;
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
	.timetable-actions button {
		gap: 0.2rem;
	}
	.timetable-utilities .ui-button {
		width: 2rem;
		height: 2rem;
	}
	@media (max-width: 760px) {
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
		.timetable-title h2 {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.timetable-title form {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto auto;
			width: 100%;
		}
		.timetable-title input {
			min-width: 0;
			max-width: none;
		}
		.rename-error {
			grid-column: 1 / -1;
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
	@media (max-width: 480px) {
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
