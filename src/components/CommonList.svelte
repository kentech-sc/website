<script lang="ts">
	import type { FilePresence, Page } from '$lib/types/general.type.js';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type';
	import type { Submission } from '$lib/types/submission.type.js';

	import { resolve } from '$app/paths';
	import CommonListPaginationBtn from '$components/CommonListPaginationBtn.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import { boardPostPath } from '$lib/shared/paths.js';
	import {
		getSubmissionStatusLabel,
		SUBMISSION_CATEGORY_LABELS,
		SUBMISSION_KIND_LABELS
	} from '$lib/shared/submission.js';
	import { parseRelativeDate } from '$lib/shared/utils.js';
	import { colorStatus, translatedTerm } from '$lib/shared/view';
	import { SubmissionKind } from '$lib/types/submission.type.js';

	let {
		page,
		filePresence
	}: {
		page: Page<Post | Submission | Review>;
		filePresence: FilePresence;
	} = $props();
</script>

{#snippet ListItem(item: Post | Submission | Review)}
	{@const itemHref =
		'boardId' in item
			? boardPostPath(item.boardId, item.id.toString())
			: 'status' in item
				? item.kind === SubmissionKind.Petition
					? resolve('/channel/petition/[submissionId]', { submissionId: item.id.toString() })
					: resolve('/channel/feedback/[submissionId]', { submissionId: item.id.toString() })
				: resolve('/academic/review/[reviewId]', { reviewId: item.id.toString() })}
	<a href={itemHref} class="list-item">
		<div class="row1">
			{#if 'status' in item}
				<span class="petition-status" style:color={colorStatus[item.status]}
					>[{getSubmissionStatusLabel(item.kind, item.status)}]</span
				>
				<span class="submission-kind">[{SUBMISSION_KIND_LABELS[item.kind]}]</span>
			{/if}
			<span class="title">{item.title}</span>
			<FileAttachmentIcons
				hasImage={filePresence[item.id.toString()]?.hasImage}
				hasFile={filePresence[item.id.toString()]?.hasFile}
			/>
			{#if 'commentCnt' in item}<span class="comment-cnt">[{item.commentCnt}]</span>{/if}
		</div>
		<div class="row2">
			<span>
				{#if 'likedBy' in item}
					{item.displayName} | 조회 {item.viewCnt} | 좋아요 {item.likedBy.length}
				{:else if 'supporterIds' in item}
					{item.authorName} | 조회 {item.viewCnt} | {item.kind === SubmissionKind.Inquiry
						? '궁금해요'
						: item.kind === SubmissionKind.Suggestion
							? '공감'
							: '동의'}
					{item.supporterIds.length}
					{#if item.category}
						| {SUBMISSION_CATEGORY_LABELS[item.category]}{/if}
				{:else if 'score' in item}
					{item.professors.length
						? `${item.professors.map((professor) => professor.name).join(', ')} 교수`
						: '담당 교수 개별 배정'} | {item.courseName}
					| {item.year}년 {translatedTerm[item.term]}학기 | 만족도 {item.score.satisfaction}/10
				{/if}
			</span>
			<span class="time">{parseRelativeDate(item.createdAt)}</span>
		</div>
	</a>
{/snippet}

{#each page.items as item (item.id)}{@render ListItem(item)}{/each}
<CommonListPaginationBtn currentPage={page.currentPage} totalPages={page.totalPages} />

<style lang="scss">
	.list-item {
		display: flex;
		flex-direction: column;
		border-bottom: solid var(--gray-border) 0.1rem;
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
	.submission-kind {
		margin-right: 0.2rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.8rem;
	}
</style>
