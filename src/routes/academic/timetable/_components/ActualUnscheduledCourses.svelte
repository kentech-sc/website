<script lang="ts">
	import type { PageData } from '../$types.js';

	import { resolve } from '$app/paths';

	let {
		completions
	}: {
		completions: PageData['actualSchedule']['unscheduledCompletions'];
	} = $props();
</script>

{#if completions.length}
	<section class="module unscheduled-records">
		<header>
			<div>
				<h3>시간표에 표시되지 않는 수강 과목</h3>
				<p>이수 내역에서 수정하거나 삭제할 수 있습니다.</p>
			</div>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hash is appended to a resolved route -->
			<a href={resolve('/academic') + '#course-history'}>이수 내역 관리</a>
		</header>
		<ul>
			{#each completions as completion (completion.id)}
				<li>
					<span><b>{completion.courseName}</b><small>{completion.courseCode}</small></span>
					<span>분반 미상</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style lang="scss">
	.unscheduled-records {
		padding: 0.8rem;
	}
	.unscheduled-records header,
	.unscheduled-records li {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.unscheduled-records header {
		gap: 0.8rem;
		margin-bottom: 0.6rem;
	}
	.unscheduled-records h3,
	.unscheduled-records p {
		margin: 0;
	}
	.unscheduled-records h3 {
		font-size: 0.8rem;
	}
	.unscheduled-records p {
		margin-top: 0.1rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.unscheduled-records a {
		flex: 0 0 auto;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.7rem;
	}
	.unscheduled-records ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.unscheduled-records li {
		gap: 0.4rem;
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.4rem 0.6rem;
	}
	.unscheduled-records li > span:first-child {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.unscheduled-records b {
		font-size: 0.7rem;
	}
	.unscheduled-records small,
	.unscheduled-records li > span:last-child {
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.unscheduled-records li > span:last-child {
		flex: 0 0 auto;
	}
</style>
