<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { parseDate } from '$lib/shared/utils.js';
	import {
		SubmissionKind,
		SubmissionStatus,
		type Submission,
		type SubmissionPermissions
	} from '$lib/types/submission.type.js';

	let { submission, permissions }: { submission: Submission; permissions: SubmissionPermissions } =
		$props();

	let isEditing = $state(false);
	const listHref = $derived(
		submission.kind === SubmissionKind.Petition ? '/channel/petition' : '/channel/feedback'
	);

	function endEditing() {
		isEditing = false;
	}
</script>

{#snippet ResponseForm(response: string | null)}
	<CommonForm
		formName={response ? 'editResponse' : 'respondToSubmission'}
		actionName={response ? 'editResponse' : 'respondToSubmission'}
		policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		afterSuccess={endEditing}
		afterConflict={endEditing}
	>
		<input type="hidden" name="submission-id" value={submission.id} />
		<label for="response">답변</label>
		<textarea id="response" name="response">{response ?? ''}</textarea>
		<br />
		<button type="submit">{response ? '수정하기' : '답변하기'}</button>
	</CommonForm>
{/snippet}

<section class="container-col module">
	{#if submission.answeredAt}
		{#if isEditing}
			{@render ResponseForm(submission.response)}
		{:else}
			<article>
				<header class="container">
					<div class="container-col">
						<h2><span class="response-label">[답변]</span> {submission.title}</h2>
						<p>{submission.responderName} | {parseDate(submission.answeredAt)}</p>
					</div>
					{#if permissions.canEditResponse}
						<button class="edit-button" type="button" onclick={() => (isEditing = true)}
							>수정</button
						>
					{/if}
					{#if permissions.canDeleteResponse}
						<div class="delete-form">
							<InlineActionForm
								actionName="deleteResponse"
								hiddenFields={[{ name: 'submission-id', value: submission.id }]}
								policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
							>
								삭제
							</InlineActionForm>
						</div>
					{/if}
				</header>
				<hr />
				<pre>{submission.response}</pre>
			</article>
		{/if}
	{:else if submission.status === SubmissionStatus.Pending && permissions.canReview}
		<InlineActionForm
			actionName="reviewSubmission"
			hiddenFields={[{ name: 'submission-id', value: submission.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
			afterConflict={endEditing}
		>
			검토하기
		</InlineActionForm>
	{:else if submission.status === SubmissionStatus.Reviewing}
		{#if permissions.canCancelReview}
			<InlineActionForm
				actionName="cancelReview"
				hiddenFields={[{ name: 'submission-id', value: submission.id }]}
				policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
				afterConflict={endEditing}
			>
				검토 취소하기
			</InlineActionForm>
		{/if}
		{#if permissions.canRespond}
			<br />
			<hr />
			{@render ResponseForm(null)}
		{/if}
	{:else if submission.status === SubmissionStatus.Ongoing}
		{#if submission.kind === SubmissionKind.Petition}
			<p>30일 안에 10명 이상이 동의하면 공식 검토가 시작됩니다.</p>
		{:else if permissions.canReview}
			<InlineActionForm
				actionName="reviewSubmission"
				hiddenFields={[{ name: 'submission-id', value: submission.id }]}
				policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
			>
				검토하기
			</InlineActionForm>
		{:else}
			<p>담당 조직의 확인을 기다리고 있습니다.</p>
		{/if}
	{:else if submission.status === SubmissionStatus.Expired}
		<p>청원 기간이 만료되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	article {
		width: 100%;

		header > div {
			align-items: flex-start;
			width: 100%;
		}
	}

	.edit-button {
		margin-right: 0.6rem;
	}

	.delete-form {
		width: fit-content;
	}

	.response-label {
		color: var(--secondary);
	}
</style>
