<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type.js';
	import type { Submission } from '$lib/types/submission.type.js';

	import { resolve } from '$app/paths';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import {
		getSubmissionStatusLabel,
		SUBMISSION_CATEGORY_LABELS,
		SUBMISSION_STATUS_COLORS
	} from '$lib/shared/submission.js';
	import { formatRelativeDate } from '$lib/shared/utils.js';
	import { SubmissionKind } from '$lib/types/submission.type.js';

	let { submission, attachment }: { submission: Submission; attachment?: FilePresence[string] } =
		$props();

	const href = $derived(
		submission.kind === SubmissionKind.Petition
			? resolve('/channel/petitions/[submissionId]', { submissionId: submission.id })
			: resolve('/channel/feedback/[submissionId]', { submissionId: submission.id })
	);
	const supportLabel = $derived(submission.kind === SubmissionKind.Petition ? '동의' : '공감');
	const answerStatusLabel = $derived(submission.status === 'answered' ? '답변 완료' : '답변 대기');
</script>

<a {href} class="content-list-item">
	<header>
		{#if submission.kind === SubmissionKind.Petition}
			<span class="status" style:color={SUBMISSION_STATUS_COLORS[submission.status]}>
				[{getSubmissionStatusLabel(submission.kind, submission.status)}]
			</span>
		{:else if submission.category}
			<span class="category">[{SUBMISSION_CATEGORY_LABELS[submission.category]}]</span>
		{/if}
		<strong>{submission.title}</strong>
		<FileAttachmentIcons hasImage={attachment?.hasImage} hasFile={attachment?.hasFile} />
		{#if submission.kind !== SubmissionKind.Petition}
			<span class:answered={submission.status === 'answered'} class="answer-status only-pc">
				{answerStatusLabel}
			</span>
		{/if}
	</header>
	<footer>
		<span>
			{submission.authorName}
			{#if submission.kind !== SubmissionKind.Petition}
				<span class="only-mobile"> · </span>
				<span class:answered={submission.status === 'answered'} class="answer-status only-mobile">
					{answerStatusLabel}
				</span>
			{/if}
			· 조회 {submission.viewCount} · {supportLabel}
			{submission.supporterIds.length}
		</span>
		<time datetime={submission.createdAt}>{formatRelativeDate(submission.createdAt)}</time>
	</footer>
</a>

<style lang="scss">
	.status,
	.category {
		flex: 0 0 auto;
		font-weight: 600;
	}

	.category {
		color: var(--secondary);
		font-size: 0.9rem;
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
</style>
