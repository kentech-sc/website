<script lang="ts">
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import Notice from '$components/Notice.svelte';
	let {
		selected,
		archivedOfferings,
		conflicts,
		busy,
		pendingEnhance
	}: {
		selected: PageData['timetables'][number] | null;
		archivedOfferings: PageData['offerings'];
		conflicts: PageData['timetableConflicts'][string];
		busy: boolean;
		pendingEnhance: SubmitFunction;
	} = $props();
	const changedOfferings = $derived(
		selected?.offerings.filter((offering) => selected.changeReasons[offering.id]) ?? []
	);
	const pendingChangedOfferings = $derived(
		changedOfferings.filter(
			(offering) =>
				selected?.changeReasons[offering.id] === 'schedule_changed' ||
				selected?.changeReasons[offering.id] === 'details_changed'
		)
	);
	const offeringName = (offeringId: string) =>
		selected?.offerings.find(({ id }) => id === offeringId)?.courseName ?? '강의';
</script>

{#if selected && archivedOfferings.length}
	<Notice tone="error">
		{#snippet icon()}<AlertTriangle size="0.9rem" aria-hidden="true" />{/snippet}
		<span
			><strong>폐강된 강의가 {archivedOfferings.length}개 있습니다.</strong> 시간표에서 제거해야 다시
			확정할 수 있습니다.</span
		>
	</Notice>
{/if}

{#if selected && pendingChangedOfferings.length}
	<Notice tone="warn">
		{#snippet icon()}<AlertTriangle size="0.9rem" aria-hidden="true" />{/snippet}
		<div>
			<strong>시간표 변경을 확인해 주세요.</strong>
			<ul>
				{#each pendingChangedOfferings as offering (offering.id)}
					<li>{offering.courseName} 강의 정보가 변경되었습니다.</li>
				{/each}
			</ul>
		</div>
		{#snippet actions()}<form
				method="POST"
				action="?/acknowledgeChanges"
				use:enhance={pendingEnhance}
			>
				<input type="hidden" name="timetableId" value={selected.id} />
				<button class="ui-button is-compact is-secondary" disabled={busy}>변경 확인</button>
			</form>{/snippet}
	</Notice>
{/if}

{#if selected && conflicts.length}
	<Notice tone="error">
		{#snippet icon()}<AlertTriangle size="0.9rem" aria-hidden="true" />{/snippet}
		<div>
			<strong>강의 시간이 겹칩니다.</strong>
			<ul>
				{#each conflicts as conflict (`${conflict.firstOfferingId}-${conflict.secondOfferingId}`)}
					<li>
						{offeringName(conflict.firstOfferingId)} · {offeringName(conflict.secondOfferingId)}
					</li>
				{/each}
			</ul>
		</div>
	</Notice>
{/if}

<style>
	ul {
		margin-top: 0.2rem;
		padding-left: 1rem;
	}
</style>
