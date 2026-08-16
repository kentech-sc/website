<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { SvelteMap } from 'svelte/reactivity';

	import type { PageData } from '../$types.js';

	let {
		completions,
		query,
		hideGrades
	}: {
		completions: PageData['completions'];
		query: string;
		hideGrades: boolean;
	} = $props();

	const statusLabel = (status: string) =>
		status === 'passed' ? '이수' : status === 'failed' ? '학제' : '수강 철회';
	const termLabel = (term: number) => ['1학기', '2학기', '하계', '동계'][term - 1] ?? `${term}학기`;
	const groups = $derived.by(() => {
		const periodToCompletions = new SvelteMap<string, PageData['completions']>();
		for (const completion of completions) {
			const period = `${completion.year}-${completion.term}`;
			periodToCompletions.set(period, [...(periodToCompletions.get(period) ?? []), completion]);
		}
		return [...periodToCompletions.entries()];
	});
</script>

{#if groups.length}
	<div class="record-groups">
		{#each groups as [period, items] (period)}
			<details class="record-group" open={query.trim().length > 0}>
				<summary>
					<span class="record-period"
						><b>{items[0].year}년 {termLabel(items[0].term)}</b><small>{items.length}과목</small
						></span
					>
					<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
				</summary>
				<ul>
					{#each items as completion (completion.id)}
						<li>
							<div class="course-copy">
								<b>{completion.courseName}</b><span
									>{completion.courseCode} · {completion.credits === 0
										? 'P'
										: `${completion.credits}학점`}{completion.grade && !hideGrades
										? ` · ${completion.grade}`
										: ''}</span
								>
							</div>
							<span
								class:failed={completion.status === 'failed'}
								class:withdrawn={completion.status === 'withdrawn'}
								class="status-badge">{statusLabel(completion.status)}</span
							>
							<form method="POST" action="?/removeCompletion">
								<input type="hidden" name="completionId" value={completion.id} /><button
									class="remove-button"
									aria-label={`${completion.courseName} 삭제`}
									title="삭제"><Trash size="0.9rem" /></button
								>
							</form>
						</li>
					{/each}
				</ul>
			</details>
		{/each}
	</div>
{:else}
	<div class="empty-records">
		<BookOpenCheck size="1.4rem" />
		<p>{query ? '검색 결과가 없습니다.' : '아직 등록된 이수 내역이 없습니다.'}</p>
	</div>
{/if}

<style lang="scss">
	.record-groups {
		display: grid;
		gap: 0.6rem;
		margin-top: 0.8rem;
	}
	.record-group {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		overflow: hidden;
	}
	.record-group summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		background: var(--gray-bg);
		padding: 0.6rem;
		list-style: none;
	}
	.record-group summary::-webkit-details-marker {
		display: none;
	}
	.record-period {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.record-period b {
		font-size: 0.7rem;
	}
	.record-period small {
		border-radius: 999px;
		background: var(--white);
		padding: 0.2rem 0.4rem;
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.record-group ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.record-group li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 0.6rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.6rem;
	}
	.record-group li:last-child {
		border-bottom: 0;
	}
	.course-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.course-copy b {
		overflow: hidden;
		font-size: 0.8rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-copy span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.status-badge {
		font-size: 0.7rem;
	}
	.status-badge.failed {
		background: var(--error-bg);
		color: var(--error-text);
	}
	.status-badge.withdrawn {
		background: var(--gray-bg);
		color: var(--gray-text);
	}
	.remove-button {
		display: grid;
		place-items: center;
		border: 0;
		background: transparent;
		padding: 0.2rem;
		color: var(--gray-text);
	}
	.remove-button:hover {
		color: var(--error-text);
	}
	.empty-records {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 2rem;
		color: var(--gray-text);
		text-align: center;
	}
	.empty-records p {
		margin: 0;
		font-size: 0.8rem;
	}
</style>
