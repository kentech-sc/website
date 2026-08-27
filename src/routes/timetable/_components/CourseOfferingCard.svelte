<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Repeat2 from '@lucide/svelte/icons/repeat-2';
	import X from '@lucide/svelte/icons/x';

	import { courseColor, formatOfferingSchedule } from './schedule-display.js';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let {
		offering,
		timetableId,
		actionKind,
		sourceOfferingId = null,
		restriction = null,
		notice = null,
		busy,
		selectedSource = false,
		enhanceAction
	}: {
		offering: Offering;
		timetableId: string;
		actionKind: 'add' | 'remove' | 'replace';
		sourceOfferingId?: string | null;
		restriction?: string | null;
		notice?: string | null;
		busy: boolean;
		selectedSource?: boolean;
		enhanceAction: SubmitFunction;
	} = $props();

	const actionUrl = $derived(
		actionKind === 'replace' ? '?/replace' : actionKind === 'remove' ? '?/removeItem' : '?/add'
	);
</script>

<article
	class="course-offering-card"
	class:is-added={actionKind === 'remove'}
	class:is-unavailable={Boolean(restriction)}
>
	<i class="course-color-marker" style={`background: ${courseColor(offering.category)}`}></i>
	<div class="course-offering-copy">
		<div class="course-offering-tags">
			{#if selectedSource}<span>선택한 강의</span>{:else}<span>{offering.category ?? '기타'}</span
				>{/if}
			<span>{offering.courseId}</span>
			{#if offering.academicCareer === 'graduate'}<span class="is-graduate">대학원</span>{/if}
			{#if restriction}<span class="is-unavailable">{restriction}</span>{:else if notice}<span
					class="has-notice">{notice}</span
				>{/if}
		</div>
		<strong
			>{offering.courseName}{#if offering.subtitle}<small>{offering.subtitle}</small>{/if}</strong
		>
		<p>{formatOfferingSchedule(offering)}</p>
		<p>
			{offering.professors.map((professor) => professor.name).join(', ') || '교수 미정'} · {offering.section}분반
			· {offering.creditType === 'pass' ? 'P' : `${offering.credits}학점`}
		</p>
	</div>
	<div class="course-offering-actions">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- query string is appended to a resolved route -->
		<a href={`${resolve('/review')}?course=${encodeURIComponent(offering.courseId)}`}>강의평가</a>
		<form method="POST" action={actionUrl} use:enhance={enhanceAction}>
			<input type="hidden" name="timetableId" value={timetableId} />
			{#if actionKind === 'replace'}
				<input type="hidden" name="fromOfferingId" value={sourceOfferingId ?? ''} />
				<input type="hidden" name="toOfferingId" value={offering.id} />
			{:else}<input type="hidden" name="offeringId" value={offering.id} />{/if}
			<button
				class="ui-button is-compact"
				class:is-primary={actionKind !== 'remove'}
				class:is-danger-outline={actionKind === 'remove'}
				disabled={busy || Boolean(restriction)}
			>
				{#if actionKind === 'replace'}<Repeat2
						size="0.8rem"
					/>교체{:else if actionKind === 'remove'}<X size="0.8rem" />제거{:else}<Plus
						size="0.8rem"
					/>추가{/if}
			</button>
		</form>
	</div>
</article>

<style lang="scss">
	.course-offering-card {
		display: grid;
		grid-template-columns: 0.2rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.6rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.6rem;
	}
	.course-offering-card.is-added {
		background: color-mix(in srgb, var(--success-bg) 45%, var(--white));
	}
	.course-offering-card.is-unavailable {
		opacity: 0.62;
	}
	.course-color-marker {
		align-self: stretch;
		border-radius: 999px;
	}
	.course-offering-copy {
		min-width: 0;
	}
	.course-offering-copy > strong {
		display: block;
		overflow: hidden;
		font-size: 0.7rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-offering-copy > strong small {
		margin-left: 0.2rem;
		color: var(--gray-text);
		font-weight: 400;
	}
	.course-offering-copy p {
		margin: 0.1rem 0 0;
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.course-offering-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		margin-bottom: 0.2rem;
	}
	.course-offering-tags span {
		border-radius: 0.2rem;
		background: var(--gray-bg);
		padding: 0.1rem 0.2rem;
		color: var(--gray-text);
		font-size: 0.5rem;
	}
	.course-offering-tags .is-unavailable {
		background: var(--error-bg);
		color: var(--error-text);
	}
	.course-offering-tags .is-graduate {
		background: var(--secondary-bg);
		color: var(--secondary);
	}
	.course-offering-tags .has-notice {
		background: var(--warn-bg);
		color: var(--warn-text);
	}
	.course-offering-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
	}
	.course-offering-actions a {
		color: var(--gray-text);
		font-size: 0.6rem;
		text-decoration: underline;
		text-underline-offset: 0.2rem;
	}
	.course-offering-actions button {
		padding: 0.2rem 0.4rem;
		font-size: 0.6rem;
	}
</style>
