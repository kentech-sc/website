<script lang="ts">
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	let {
		actualSelected,
		selected,
		editingName = $bindable(false),
		renameError,
		onCancelRename,
		renameEnhance
	}: {
		actualSelected: boolean;
		selected: PageData['timetables'][number] | null;
		editingName?: boolean;
		renameError: string;
		onCancelRename: () => void;
		renameEnhance: SubmitFunction;
	} = $props();
</script>

{#if actualSelected}
	<h2>실제 수강</h2>
	<span class="status-badge"><CheckCircle size="0.8rem" />수강 기록</span>
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
		<span class="status-badge"><CheckCircle size="0.8rem" />확정</span>
	{/if}
{/if}

<style lang="scss">
	h2 {
		margin: 0;
		font-size: 0.9rem;
	}
	form {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}
	input {
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
	.status-badge {
		flex-shrink: 0;
		font-size: 0.7rem;
	}
	@media (width <= 760px) {
		h2 {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		form {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto auto;
			width: 100%;
		}
		input {
			min-width: 0;
			max-width: none;
		}
		.rename-error {
			grid-column: 1 / -1;
		}
	}
</style>
