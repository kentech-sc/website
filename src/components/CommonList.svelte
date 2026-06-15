<script lang="ts">
	import type { FilePresence, Page } from '$lib/types/general.type.js';
	import type { Petition } from '$lib/types/petition.type';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type';

	import CommonListPaginationBtn from '$components/CommonListPaginationBtn.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import { parseRelativeDate } from '$lib/shared/utils.js';
	import { translatedTerm, colorStatus, translatedStatus } from '$lib/shared/view';

	let {
		href,
		page,
		filePresence
	}: {
		href: string;
		page: Page<Post | Petition | Review>;
		filePresence: FilePresence;
	} = $props();
</script>

{#snippet ListItem(item: Post | Petition | Review, href: string)}
	<a href="{href}/{item._id}" class="list-item">
		<div class="row1">
			{#if 'status' in item}
				<span class="petition-status" style:color={colorStatus[item.status]}
					>[{translatedStatus[item.status]}]</span
				>
			{/if}
			<span class="title">{item.title}</span>
			<FileAttachmentIcons
				hasImage={filePresence[item._id.toString()]?.hasImage}
				hasFile={filePresence[item._id.toString()]?.hasFile}
			/>
			{#if 'commentCnt' in item}
				<span class="comment-cnt">[{item.commentCnt}]</span>
			{/if}
		</div>
		<div class="row2">
			<span class="meta">
				{#if 'likedBy' in item}
					{item.displayName} | 조회 {item.viewCnt} | 좋아요 {item.likedBy.length}
				{:else if 'signedBy' in item}
					{item.petitionerName} | 조회 {item.viewCnt} | 동의 {item.signedBy.length}
				{:else if 'score' in item}
					{item.professorName} 교수님 | {item.courseName} | {item.year}년 {translatedTerm[
						item.term
					]}학기 | 만족도 {item.score.satisfaction}/10
				{/if}
			</span>
			<span class="time">{parseRelativeDate(item.createdAt)}</span>
		</div>
	</a>
{/snippet}

{#each page.items as item (item._id)}
	{@render ListItem(item, href)}
{/each}
<CommonListPaginationBtn currentPage={page.currentPage} totalPages={page.totalPages} />

<style lang="scss">
	.list-item {
		display: flex;
		flex-direction: column;

		border-bottom: solid var(--gray-border) 0.05rem;
		padding: 0.6rem 0.8rem;

		width: 100%;

		color: black;
		text-decoration: none;

		&:first-child {
			border-radius: 0.6rem 0.6rem 0 0;
		}

		&:hover {
			background-color: var(--gray-bg);
		}

		.row1 {
			display: flex;
			align-items: center;

			.title {
				flex: 1;
				overflow: hidden;
				font-weight: 600;
				font-size: 1rem;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.row2 {
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: var(--gray-text);
			font-size: 0.8rem;

			.time {
				flex-shrink: 0;
			}
		}
	}

	.comment-cnt {
		flex-shrink: 0;
		margin-left: 0.2rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.7rem;
	}

	.petition-status {
		margin-right: 0.2rem;
		font-weight: 600;
	}
</style>
