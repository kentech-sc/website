<script lang="ts">
	import '$style/nmu.scss';

	import PenTool from '@lucide/svelte/icons/pen-tool';
	import Trash from '@lucide/svelte/icons/trash-2';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Submission, SubmissionPermissions } from '$lib/types/submission.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonArticleHeader from '$components/CommonArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { SubmissionKind } from '$lib/types/submission.type.js';

	let {
		submission,
		user,
		permissions
	}: { submission: Submission; user: User; permissions: SubmissionPermissions } = $props();

	let supported = $derived<boolean>(submission.supporterIds.includes(user.id));
	const listHref = $derived(
		submission.kind === SubmissionKind.Petition ? '/channel/petition' : '/channel/feedback'
	);
	const supportLabel = $derived(
		submission.kind === SubmissionKind.Inquiry
			? '나도 궁금해요'
			: submission.kind === SubmissionKind.Suggestion
				? '공감해요'
				: '동의해요'
	);
</script>

{#snippet SupportButton()}
	{#if permissions.canSupport || permissions.canCancelSupport}
		<InlineActionForm
			actionName={supported ? 'cancelSupport' : 'supportSubmission'}
			buttonClass="container sign-btn"
			hiddenFields={[{ name: 'submission-id', value: submission.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			<PenTool size="1rem" color="var(--secondary)" fill={supported ? 'skyblue' : 'transparent'} />
			{#if supported}
				<span>취소하기</span>
			{:else}
				<span>{supportLabel}</span>
			{/if}
		</InlineActionForm>
	{/if}
{/snippet}

{#snippet ActionGroup()}
	{#if permissions.canDelete}
		<div class="delete-form">
			<InlineActionForm
				actionName="deleteSubmission"
				buttonClass="inline-container"
				hiddenFields={[{ name: 'submission-id', value: submission.id }]}
				policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
			>
				<Trash size="1.2rem" />
			</InlineActionForm>
		</div>
	{/if}
{/snippet}

<section class="container-col module">
	<article>
		<CommonArticleHeader type="submission" item={submission}>
			{@render ActionGroup()}
		</CommonArticleHeader>
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(submission.content)}</pre>
		{@render SupportButton()}
	</article>
</section>

<style lang="scss">
	article {
		width: 100%;

		pre :global(img) {
			max-width: 100%;
		}
	}

	.delete-form :global(button) {
		border: none;
		padding: 0.2rem 0.4rem;
		color: var(--error);
	}

	:global(.sign-btn) {
		gap: 0.2rem;
		margin-top: 0.6rem;
		margin-bottom: 0.2rem;
		border: solid 0.1rem var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		font-size: 0.9rem;
	}
</style>
