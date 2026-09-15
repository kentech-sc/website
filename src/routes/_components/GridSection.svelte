<script lang="ts">
	import type { PostPreview } from '$lib/types/post.type.js';
	import type { ReviewPreview } from '$lib/types/review.type.js';
	import type { SubmissionPreview } from '$lib/types/submission.type.js';

	import { resolve } from '$app/paths';
	import { getSubmissionStatusLabel } from '$lib/shared/submission.js';
	import { parseDate } from '$lib/shared/utils.js';
	import { colorStatus } from '$lib/shared/view.js';

	type GridLink = 'board/notice' | 'channel/petition' | 'channel/feedback' | 'academic/review';
	type GridItem = ReviewPreview | PostPreview | SubmissionPreview;

	let { title, items, link }: { title: string; items: GridItem[]; link: GridLink } = $props();
</script>

{#snippet Header()}
	{@const sectionHref = link.startsWith('channel/')
		? link === 'channel/petition'
			? resolve('/channel/petition')
			: resolve('/channel/feedback')
		: link === 'academic/review'
			? resolve('/academic/review')
			: resolve('/board/[boardId=board]', { boardId: 'notice' })}
	<h2>{title}<a href={sectionHref}>더보기</a></h2>
{/snippet}

{#snippet Item(item: GridItem)}
	{@const itemHref =
		'boardId' in item
			? resolve('/board/[boardId=board]/[postId]', {
					boardId: item.boardId,
					postId: item.id.toString()
				})
			: 'kind' in item
				? item.kind === 'petition'
					? resolve('/channel/petition/[submissionId]', { submissionId: item.id.toString() })
					: resolve('/channel/feedback/[submissionId]', { submissionId: item.id.toString() })
				: resolve('/academic/review/[reviewId]', { reviewId: item.id.toString() })}
	<a href={itemHref} class="container grid-item">
		<span>
			{#if 'kind' in item}
				<span
					class={(item as SubmissionPreview).status}
					style:color={colorStatus[(item as SubmissionPreview).status]}
					>[{getSubmissionStatusLabel(
						(item as SubmissionPreview).kind,
						(item as SubmissionPreview).status
					)}]</span
				>
			{/if}
			{item.title}
		</span>
		<span>{parseDate(item.createdAt, 'date')}</span>
	</a>
{/snippet}

<section class="module">
	{@render Header()}
	<hr />
	{#if items.length === 0}
		<p>작성된 글이 없습니다.</p>
	{:else}
		{#each items as item (item.id)}{@render Item(item)}{/each}
	{/if}
</section>

<style lang="scss">
	section {
		width: auto;
	}

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		font-size: 1.2rem;

		a {
			font-size: 0.7rem;
		}
	}

	.grid-item {
		justify-content: space-between;
		padding: 0.2rem;
		color: black;

		span {
			font-size: 0.9rem;
		}

		span:first-child {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		span:last-child {
			white-space: nowrap;
		}

		&:nth-child(2n + 1) {
			background-color: var(--gray-bg);
		}

		&:hover {
			cursor: pointer;
			background-color: var(--gray-hover);
			text-decoration: none;
		}
	}
</style>
