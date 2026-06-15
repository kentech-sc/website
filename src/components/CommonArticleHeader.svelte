<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Heart from '@lucide/svelte/icons/heart';
	import Message from '@lucide/svelte/icons/message-circle';
	import PenTool from '@lucide/svelte/icons/pen-tool';

	import type { Petition } from '$lib/types/petition.type';
	import type { Post } from '$lib/types/post.type';
	import type { Review } from '$lib/types/review.type';
	import type { Snippet } from 'svelte';

	import { parseDate } from '$lib/shared/utils.js';
	import { translatedTerm, translatedStatus, colorStatus } from '$lib/shared/view';

	const {
		type,
		item,
		children
	}: { type: 'post' | 'petition' | 'review'; item: Post | Petition | Review; children: Snippet } =
		$props();
</script>

{#snippet Title()}
	<h2 class="title">
		{#if type === 'review'}
			[{(item as Review).courseId}] {(item as Review).courseName}
		{:else if type === 'petition'}
			<span class="petition-status" style:color={colorStatus[(item as Petition).status]}
				>[{translatedStatus[(item as Petition).status]}]</span
			>
			{item.title}
		{:else if type === 'post'}
			{item.title}
		{/if}
	</h2>
{/snippet}

{#snippet Author()}
	<p class="author">
		{#if type === 'post'}
			{(item as Post).displayName}
		{:else if type === 'petition'}
			{(item as Petition).petitionerName}
		{:else if type === 'review'}
			{(item as Review).professorName} 교수님
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
		{/if}

		{#if type === 'petition'}
			<span><Eye size="0.8rem" color="var(--gray-text)" />{(item as Petition).viewCnt}</span>
			<span
				><PenTool size="0.8rem" color="var(--gray-text)" />{(item as Petition).signedBy
					.length}</span
			>
		{/if}

		{#if type === 'review'}
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
</style>
