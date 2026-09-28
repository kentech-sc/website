<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';
	import X from '@lucide/svelte/icons/x';

	import type { Submission, SubmissionPermissions } from '$lib/types/submission.type.js';

	import ActionForm from '$components/ActionForm.svelte';
	import ArticleHeader from '$components/ArticleHeader.svelte';
	import FormField from '$components/FormField.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { formatDate } from '$lib/shared/utils.js';

	let {
		submission,
		permissions,
		listHref
	}: {
		submission: Submission;
		permissions: SubmissionPermissions;
		listHref: string;
	} = $props();

	let isEditing = $state(false);
	let responseLoading = $state(false);

	function endEditing() {
		isEditing = false;
	}
</script>

{#snippet ResponseForm(response: string | null)}
	{@const formName = response ? 'updateResponse' : 'respond'}
	<div class="content-form">
		<ActionForm
			{formName}
			actionName={formName}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
			afterSuccess={endEditing}
			afterConflict={endEditing}
			bind:loading={responseLoading}
		>
			<input type="hidden" name="submission-id" value={submission.id} />
			<FormField inputId="response" label="답변">
				<textarea id="response" name="response" rows="8">{response ?? ''}</textarea>
			</FormField>
		</ActionForm>
		<footer>
			{#if response}
				<button
					type="button"
					class="ui-button is-secondary"
					disabled={responseLoading}
					onclick={endEditing}
				>
					<X size="0.8rem" />취소
				</button>
			{/if}
			<button type="submit" class="ui-button is-primary" form={formName} disabled={responseLoading}>
				<Pencil size="0.8rem" />{response ? '수정' : '답변'}
			</button>
		</footer>
	</div>
{/snippet}

{#snippet actions()}
	{#if permissions.canEditResponse}
		<button
			type="button"
			class="ui-button is-icon is-primary"
			aria-label="답변 수정"
			onclick={() => (isEditing = true)}
		>
			<Pencil size="1rem" />
		</button>
	{/if}
	{#if permissions.canDeleteResponse}
		<InlineActionForm
			actionName="deleteResponse"
			buttonLabel="답변 삭제"
			buttonClass="ui-button is-icon is-danger"
			hiddenFields={[{ name: 'submission-id', value: submission.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			<Trash size="1rem" />
		</InlineActionForm>
	{/if}
{/snippet}

{#if submission.answeredAt}
	<section class="module">
		{#if isEditing}
			{@render ResponseForm(submission.response)}
		{:else}
			<article>
				<ArticleHeader {actions}>
					{#snippet title()}<span class="response-label">[답변]</span> {submission.title}{/snippet}
					{#snippet metadata()}
						<span>{submission.responderName}</span>
						<span><Clock size="0.8rem" />{formatDate(submission.answeredAt!)}</span>
					{/snippet}
				</ArticleHeader>
				<pre>{submission.response}</pre>
			</article>
		{/if}
	</section>
{:else if permissions.canRespond}
	<section class="module">
		{@render ResponseForm(null)}
	</section>
{/if}

<style lang="scss">
	section,
	article {
		width: 100%;
	}

	.response-label {
		color: var(--secondary);
	}
</style>
