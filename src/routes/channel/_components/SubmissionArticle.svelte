<script lang="ts">
	import '$style/nmu.scss';

	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import MessageCircleCheck from '@lucide/svelte/icons/message-circle-check';
	import MessageCircleMore from '@lucide/svelte/icons/message-circle-more';
	import PenTool from '@lucide/svelte/icons/pen-tool';
	import Pencil from '@lucide/svelte/icons/pencil';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import Trash from '@lucide/svelte/icons/trash-2';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Submission, SubmissionPermissions } from '$lib/types/submission.type.js';
	import type { User } from '$lib/types/user.type.js';

	import { resolve } from '$app/paths';
	import ArticleHeader from '$components/ArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import {
		getSubmissionStatusLabel,
		SUBMISSION_CATEGORY_LABELS,
		SUBMISSION_STATUS_COLORS
	} from '$lib/shared/submission.js';
	import { formatDate } from '$lib/shared/utils.js';
	import { SubmissionKind } from '$lib/types/submission.type.js';

	let {
		submission,
		user,
		permissions
	}: { submission: Submission; user: User; permissions: SubmissionPermissions } = $props();

	let supported = $derived<boolean>(submission.supporterIds.includes(user.id));
	const listHref = $derived(
		submission.kind === SubmissionKind.Petition ? '/channel/petitions' : '/channel/feedback'
	);
	const supportLabel = $derived(
		submission.kind === SubmissionKind.Petition ? '동의해요' : '공감해요'
	);
	const answerStatusLabel = $derived(submission.status === 'answered' ? '답변 완료' : '답변 대기');
	const editHref = $derived(
		submission.kind === SubmissionKind.Petition
			? resolve('/channel/petitions/[submissionId]/edit', { submissionId: submission.id })
			: resolve('/channel/feedback/[submissionId]/edit', { submissionId: submission.id })
	);
</script>

{#snippet SupportButton()}
	{#if permissions.canSupport || permissions.canCancelSupport}
		<InlineActionForm
			actionName={supported ? 'cancelSupport' : 'supportSubmission'}
			buttonClass="ui-button"
			buttonLabel={supported ? `${supportLabel} 취소` : supportLabel}
			hiddenFields={[{ name: 'submission-id', value: submission.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			{#if submission.kind === SubmissionKind.Petition}
				<PenTool
					size="1rem"
					color="var(--secondary)"
					fill={supported ? 'skyblue' : 'transparent'}
				/>
			{:else}
				<ThumbsUp
					size="1rem"
					color="var(--secondary)"
					fill={supported ? 'skyblue' : 'transparent'}
				/>
			{/if}
			{#if submission.kind !== SubmissionKind.Petition}
				<span>{submission.supporterIds.length}</span>
			{:else if supported}
				<span>취소하기</span>
			{:else}
				<span>{supportLabel}</span>
			{/if}
		</InlineActionForm>
	{:else}
		<div class="ui-button" aria-disabled="true" aria-label={`${supportLabel} 불가`}>
			{#if submission.kind === SubmissionKind.Petition}
				<PenTool size="1rem" color="var(--secondary)" fill="transparent" />
			{:else}
				<ThumbsUp size="1rem" color="var(--secondary)" fill="transparent" />
			{/if}
			<span>
				{submission.kind === SubmissionKind.Petition
					? supportLabel
					: submission.supporterIds.length}
			</span>
		</div>
	{/if}
{/snippet}

{#snippet actions()}
	{#if permissions.canEdit}
		<a class="ui-button is-icon is-primary" aria-label="수정" href={editHref}>
			<Pencil size="1rem" />
		</a>
	{/if}
	{#if permissions.canDelete}
		<InlineActionForm
			actionName="deleteSubmission"
			buttonLabel="삭제"
			buttonClass="ui-button is-icon is-danger"
			hiddenFields={[{ name: 'submission-id', value: submission.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			<Trash size="1rem" />
		</InlineActionForm>
	{/if}
{/snippet}

<article class="module">
	<ArticleHeader {actions}>
		{#snippet title()}
			{#if submission.kind === SubmissionKind.Petition}
				<span style:color={SUBMISSION_STATUS_COLORS[submission.status]}>
					[{getSubmissionStatusLabel(submission.kind, submission.status)}]
				</span>
			{:else if submission.category}
				<span class="submission-category">[{SUBMISSION_CATEGORY_LABELS[submission.category]}]</span>
			{/if}
			{submission.title}
		{/snippet}
		{#snippet metadata()}
			<span>{submission.authorName}</span>
			<span><Clock size="0.8rem" />{formatDate(submission.createdAt)}</span>
			<span><Eye size="0.8rem" />{submission.viewCount}</span>
			<span>
				{#if submission.kind === SubmissionKind.Petition}
					<PenTool size="0.8rem" />
				{:else}
					<ThumbsUp size="0.8rem" />
				{/if}
				{submission.supporterIds.length}
			</span>
			{#if submission.kind !== SubmissionKind.Petition}
				<span class:answered={submission.status === 'answered'} class="answer-status">
					{#if submission.status === 'answered'}
						<MessageCircleCheck size="0.8rem" />
					{:else}
						<MessageCircleMore size="0.8rem" />
					{/if}
					{answerStatusLabel}
				</span>
			{/if}
		{/snippet}
	</ArticleHeader>
	<!-- eslint-disable svelte/no-at-html-tags -->
	<pre class="nmu">{@html DOMPurify.sanitize(submission.content)}</pre>
	<footer>{@render SupportButton()}</footer>
</article>

<style lang="scss">
	article {
		pre :global(img) {
			max-width: 100%;
		}
	}

	footer {
		display: flex;
		margin: 0.6rem 0 0.2rem;
	}

	.submission-category {
		margin-right: 0.2rem;
		color: var(--secondary);
	}

	.answer-status.answered {
		color: var(--success-text);
	}
</style>
