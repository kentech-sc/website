<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Heart from '@lucide/svelte/icons/heart';
	import Message from '@lucide/svelte/icons/message-circle';
	import PenTool from '@lucide/svelte/icons/pen-tool';

	import type { Post } from '$lib/types/post.type';
	import type { Review } from '$lib/types/review.type';
	import type { Submission } from '$lib/types/submission.type.js';
	import type { Snippet } from 'svelte';

	import {
		getSubmissionStatusLabel,
		SUBMISSION_CATEGORY_LABELS,
		SUBMISSION_KIND_LABELS
	} from '$lib/shared/submission.js';
	import { parseDate } from '$lib/shared/utils.js';
	import { colorStatus, translatedTerm } from '$lib/shared/view';

	const {
		type,
		item,
		children
	}: {
		type: 'post' | 'submission' | 'review';
		item: Post | Submission | Review;
		children: Snippet;
	} = $props();
</script>

{#snippet Title()}
	<h2 class="title">
		{#if type === 'review'}
			[{(item as Review).courseId}] {(item as Review).courseName}
		{:else if type === 'submission'}
			<span class="petition-status" style:color={colorStatus[(item as Submission).status]}>
				[{getSubmissionStatusLabel((item as Submission).kind, (item as Submission).status)}]
			</span>
			<span class="submission-kind">[{SUBMISSION_KIND_LABELS[(item as Submission).kind]}]</span>
			{item.title}
		{:else}
			{item.title}
		{/if}
	</h2>
{/snippet}

{#snippet Author()}
	<p class="author">
		{#if type === 'post'}
			{(item as Post).displayName}
		{:else if type === 'submission'}
			{(item as Submission).authorName}
		{:else}
			{(item as Review).professors.length
				? `${(item as Review).professors.map((professor) => professor.name).join(', ')} 교수`
				: '담당 교수 개별 배정'}
		{/if}
	</p>
{/snippet}

{#snippet Meta()}
	<p class="meta container">
		<span><Clock size="0.8rem" color="var(--gray-text)" />{parseDate(item.createdAt)}</span>
		{#if type === 'post'}
			<span><Eye size="0.8rem" color="var(--gray-text)" />{(item as Post).viewCnt}</span>
			<span><Message size="0.8rem" color="var(--gray-text)" />{(item as Post).commentCnt}</span>
			<span><Heart size="0.8rem" color="var(--gray-text)" />{(item as Post).likedBy.length}</span>
		{:else if type === 'submission'}
			<span><Eye size="0.8rem" color="var(--gray-text)" />{(item as Submission).viewCnt}</span>
			<span
				><PenTool size="0.8rem" color="var(--gray-text)" />{(item as Submission).supporterIds
					.length}</span
			>
			{#if (item as Submission).category}
				<span>{SUBMISSION_CATEGORY_LABELS[(item as Submission).category!]}</span>
			{/if}
		{:else}
			<span>
				<Calendar size="0.8rem" color="var(--gray-text)" />
				{(item as Review).year}년 {translatedTerm[(item as Review).term]}학기 수강
			</span>
		{/if}
	</p>
{/snippet}

<header class="container">
	<div class="container-col">
		{@render Title()}
		{@render Author()}
		{@render Meta()}
	</div>
	{@render children()}
</header>

<style lang="scss">
	header {
		justify-content: space-between;
		align-items: flex-start;
		& > div {
			align-items: flex-start;
			gap: 0.2rem;
			.title {
				font-weight: 600;
				font-size: 1.4rem;
			}
			.author {
				font-size: 0.9rem;
			}
			.meta {
				gap: 0.6rem;
				color: var(--gray-text);
				font-size: 0.7rem;
				span {
					display: flex;
					align-items: center;
					gap: 0.2rem;
				}
			}
		}
	}
	.petition-status {
		margin-right: 0.2rem;
	}

	.submission-kind {
		margin-right: 0.2rem;
		color: var(--secondary);
	}
</style>
