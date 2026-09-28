<script lang="ts">
	import type { PostPreview } from '$lib/types/post.type.js';
	import type { ReviewPreview } from '$lib/types/review.type.js';
	import type { SubmissionPreview } from '$lib/types/submission.type.js';

	import { resolve } from '$app/paths';
	import PanelHeader from '$components/PanelHeader.svelte';
	import { getSubmissionStatusLabel, SUBMISSION_CATEGORY_LABELS } from '$lib/shared/submission.js';
	import { formatDate } from '$lib/shared/utils.js';
	import { SUBMISSION_STATUS_COLORS } from '$lib/shared/view.js';
	import { SubmissionKind } from '$lib/types/submission.type.js';

	type GridItem = ReviewPreview | PostPreview | SubmissionPreview;

	let { title, items, href }: { title: string; items: GridItem[]; href: string } = $props();
</script>

{#snippet Item(item: GridItem)}
	{@const itemHref =
		'boardId' in item
			? resolve('/boards/[boardId=board]/[postId]', {
					boardId: item.boardId,
					postId: item.id.toString()
				})
			: 'kind' in item
				? item.kind === 'petition'
					? resolve('/channel/petitions/[submissionId]', { submissionId: item.id.toString() })
					: resolve('/channel/feedback/[submissionId]', { submissionId: item.id.toString() })
				: resolve('/academic/reviews/[reviewId]', { reviewId: item.id.toString() })}
	<a href={itemHref} class="container grid-item">
		<span>
			{#if 'kind' in item}
				{#if item.kind === SubmissionKind.Petition}
					<span class={item.status} style:color={SUBMISSION_STATUS_COLORS[item.status]}>
						[{getSubmissionStatusLabel(item.kind, item.status)}]
					</span>
				{:else if item.category}
					<span class="category">[{SUBMISSION_CATEGORY_LABELS[item.category]}]</span>
				{/if}
			{/if}
			{item.title}
		</span>
		{#if 'kind' in item}
			{#if item.kind === SubmissionKind.Petition}
				<span class="answer-status">동의 {item.supportCount}</span>
			{:else}
				<span class:answered={item.status === 'answered'} class="answer-status">
					{item.status === 'answered' ? '답변 완료' : '답변 대기'}
				</span>
			{/if}
		{:else}
			<span>{formatDate(item.createdAt, 'date')}</span>
		{/if}
	</a>
{/snippet}

<section class="module">
	<PanelHeader {title}>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- parent passes a resolved route -->
		<a class="more" {href}>더보기</a>
	</PanelHeader>
	{#if items.length === 0}
		<p class="no-items">작성된 글이 없습니다.</p>
	{:else}
		{#each items as item (item.id)}{@render Item(item)}{/each}
	{/if}
</section>

<style lang="scss">
	section {
		width: auto;
	}

	.more {
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.7rem;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.no-items {
		font-size: 0.9rem;
	}

	.grid-item {
		justify-content: space-between;
		padding: 0.2rem 0.3rem;
		color: black;

		span {
			font-size: 0.9rem;
		}

		span:first-child {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		& > span:last-child {
			font-size: 0.7rem;
			white-space: nowrap;
		}

		&:nth-child(2n + 0) {
			background-color: var(--gray-bg);
		}

		&:hover {
			cursor: pointer;
			background-color: var(--gray-hover);
			text-decoration: none;
		}
		.category {
			color: var(--secondary);
			font-weight: 600;
		}

		.answer-status {
			flex: 0 0 auto;
			border-radius: 999rem;
			background: var(--gray-bg);
			padding: 0.15rem 0.4rem;
			color: var(--gray-text);
			font-weight: 600;
			font-size: 0.7rem;
			line-height: 1rem;

			&.answered {
				background: var(--success-bg);
				color: var(--success-text);
			}
		}
	}
</style>
