<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import Search from '@lucide/svelte/icons/search';

	import CompletionHistory from './CompletionHistory.svelte';
	import ManualCompletionDialog from './ManualCompletionDialog.svelte';
	import PortalCompletionImport from './PortalCompletionImport.svelte';

	import type { ActionData, PageData } from '../$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let historyQuery = $state('');

	const filteredCompletions = $derived(
		data.completions.filter((completion) =>
			`${completion.courseCode} ${completion.courseName} ${completion.year}`
				.toLowerCase()
				.includes(historyQuery.trim().toLowerCase())
		)
	);
</script>

{#if data.academicProfile}
	<section class="module academic-records" id="course-history">
		<header class="records-header">
			<div class="records-title">
				<BookOpenCheck size="1.1rem" />
				<div>
					<h2>이수 내역</h2>
					<p>직접 등록한 내용을 기준으로 계산합니다.</p>
				</div>
			</div>
			<label class="records-search">
				<Search size="0.9rem" />
				<input
					type="search"
					bind:value={historyQuery}
					placeholder="과목명·코드 검색"
					aria-label="이수 내역 검색"
				/>
			</label>
		</header>

		<div class="record-entry-tools">
			<PortalCompletionImport courses={data.courses} {form} />
			<ManualCompletionDialog courses={data.courses} />
		</div>

		<CompletionHistory
			completions={filteredCompletions}
			query={historyQuery}
			hideGrades={data.academicProfile.hideGrades ?? false}
		/>
	</section>
{/if}

<style lang="scss">
	.academic-records {
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.8rem;
		background: var(--white);
		padding: 1rem;
	}
	.records-header,
	.records-title,
	.records-search {
		display: flex;
		align-items: center;
	}
	.records-header {
		justify-content: space-between;
		gap: 0.8rem;
	}
	.records-title {
		gap: 0.6rem;
	}
	.records-title > :global(svg) {
		color: var(--secondary);
	}
	.records-title h2,
	.records-title p {
		margin: 0;
	}
	.records-title h2 {
		font-size: 1rem;
	}
	.records-title p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.records-search {
		gap: 0.4rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding-left: 0.6rem;
		color: var(--gray-text);
	}
	.records-search input {
		border: 0;
		width: 11rem;
	}
	.record-entry-tools {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		align-items: start;
		gap: 0.6rem;
		margin-top: 1rem;
	}
	@media (max-width: 850px) {
		.record-entry-tools {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 600px) {
		.records-header {
			flex-direction: column;
			align-items: stretch;
		}
		.records-search input {
			width: 100%;
		}
	}
</style>
