<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { parseDate } from '$lib/shared/utils.js';
	import {
		PetitionStatus,
		type Petition,
		type PetitionPermissions
	} from '$lib/types/petition.type.js';

	let { petition, permissions }: { petition: Petition; permissions: PetitionPermissions } =
		$props();

	let isEditing = $state(false);

	function endEditing() {
		isEditing = false;
	}
</script>

{#snippet ResponseForm(response: string | null)}
	<CommonForm
		formName={response ? 'editResponse' : 'responseToPetition'}
		actionName={response ? 'editResponse' : 'responseToPetition'}
		policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
		afterSuccess={endEditing}
		afterConflict={endEditing}
	>
		<input type="hidden" name="petition-id" value={petition._id} />
		<label for="response">답변</label>
		<textarea id="response" name="response">{response ?? ''}</textarea>
		<br />
		<button type="submit">{response ? '수정하기' : '답변하기'}</button>
	</CommonForm>
{/snippet}

<section class="container-col module" id="response-section">
	{#if petition.answeredAt}
		{#if isEditing}
			{@render ResponseForm(petition.response)}
		{:else}
			<article>
				<header class="container">
					<div class="container-col">
						<h2><span style="color: purple">[답변]</span> {petition.title}</h2>
						<p>{petition.responderName} | {parseDate(petition.answeredAt)}</p>
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
								hiddenFields={[{ name: 'petition-id', value: petition._id }]}
								policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
							>
								삭제
							</InlineActionForm>
						</div>
					{/if}
				</header>
				<hr />
				<pre>{petition.response}</pre>
			</article>
		{/if}
	{:else if petition.status === PetitionStatus.Pending && permissions.canReview}
		<InlineActionForm
			actionName="reviewPetition"
			hiddenFields={[{ name: 'petition-id', value: petition._id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
			afterConflict={endEditing}
		>
			검토하기
		</InlineActionForm>
	{:else if petition.status === PetitionStatus.Reviewing}
		{#if permissions.canUnreview}
			<InlineActionForm
				actionName="unreviewPetition"
				hiddenFields={[{ name: 'petition-id', value: petition._id }]}
				policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
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
	{:else if petition.status === PetitionStatus.Ongoing}
		<p>30명 이상이 동의하면 학생회가 검토하고 답변합니다.</p>
	{:else if petition.status === PetitionStatus.Expired}
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
</style>
