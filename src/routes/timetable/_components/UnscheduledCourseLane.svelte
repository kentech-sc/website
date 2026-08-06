<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';

	interface Props {
		offerings: Offering[];
		timetableId: string;
		busy: boolean;
		pendingEnhance: SubmitFunction;
		onopen: () => void;
		courseColor: (category: string | null) => string;
	}

	let { offerings, timetableId, busy, pendingEnhance, onopen, courseColor }: Props = $props();
</script>

<div class="unscheduled-lane">
	<span class="lane-label">시간 미정</span>
	{#each offerings as offering (offering.id)}
		<article style={`--course-color: ${courseColor(offering.category)}`}>
			<div>
				<strong>{offering.courseName}</strong>
				<small
					>{offering.professors.map((professor) => professor.name).join(', ') || '교수 미정'} ·
					{offering.section}분반</small
				>
			</div>
			<form method="POST" action="?/removeItem" use:enhance={pendingEnhance}>
				<input type="hidden" name="timetableId" value={timetableId} />
				<input type="hidden" name="offeringId" value={offering.id} />
				<button
					disabled={busy}
					aria-label={`${offering.courseName} 시간표에서 제거`}
					title={`${offering.courseName} 제거`}><X size="0.68rem" /></button
				>
			</form>
		</article>
	{/each}
	{#if offerings.length < 5}
		<button
			type="button"
			class="unscheduled-slot"
			disabled={busy}
			onclick={onopen}
			aria-label="시간 미정 강의 추가"
			title="시간 미정 강의 찾기"
		>
			<Plus size="0.78rem" aria-hidden="true" />
		</button>
	{/if}
</div>

<style lang="scss">
	.unscheduled-lane {
		display: grid;
		grid-template-columns: clamp(2.7rem, 6vw, 3.2rem) repeat(5, minmax(0, 1fr));
		border-top: var(--divider-border-width) solid var(--gray-border);
	}
	.lane-label {
		display: grid;
		place-items: center;
		border-right: var(--divider-border-width) solid var(--gray-border);
		background: var(--gray-bg);
		padding: 0.5rem 0.2rem;
		color: var(--gray-text);
		font-weight: 600;
		font-size: 0.58rem;
		text-align: center;
	}
	article,
	.unscheduled-slot {
		margin: 0.25rem;
		min-height: 2.9rem;
	}
	article {
		display: flex;
		position: relative;
		align-items: stretch;
		border-top: 0.18rem solid var(--course-color);
		border-radius: 0 0 0.34rem 0.34rem;
		background: color-mix(in srgb, var(--course-color) 11%, var(--white));
		overflow: hidden;
	}
	article > div {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		padding: 0.28rem 1.15rem 0.28rem 0.4rem;
		min-width: 0;
	}
	article strong,
	article small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	article strong {
		font-size: 0.68rem;
	}
	article small {
		color: var(--gray-text);
		font-size: 0.55rem;
	}
	article form {
		position: absolute;
		top: 0.12rem;
		right: 0.1rem;
	}
	article form button {
		display: grid;
		place-items: center;
		opacity: 0.55;
		border: 0;
		background: transparent;
		padding: 0;
		width: 0.95rem;
		height: 0.95rem;
		color: var(--gray-text);
	}
	article form button:hover,
	article form button:focus-visible {
		opacity: 1;
		outline: 0;
		background: var(--error-bg);
		color: var(--error-text);
	}
	.unscheduled-slot {
		display: grid;
		place-items: center;
		cursor: cell;
		border: 0;
		border-radius: 0.28rem;
		background: var(--white);
		color: color-mix(in srgb, var(--gray-text) 55%, transparent);
	}
	.unscheduled-slot:hover:not(:disabled),
	.unscheduled-slot:focus-visible {
		outline: 0;
		background: color-mix(in srgb, var(--secondary) 8%, var(--white));
		color: var(--secondary);
	}
</style>
