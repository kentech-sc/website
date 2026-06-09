<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import {
		PetitionStatus,
		type Petition,
		type PetitionPermissions
	} from '$lib/types/petition.type.js';

	import { parseDate } from '$lib/shared/utils.js';

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
							<CommonForm
								actionName="deleteResponse"
								formName="deleteResponse"
								policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
							>
								<input type="hidden" name="petition-id" value={petition._id} />
								<button type="submit">삭제</button>
							</CommonForm>
						</div>
					{/if}
				</header>
				<hr />
				<pre>{petition.response}</pre>
			</article>
		{/if}
	{:else if petition.status === PetitionStatus.Pending && permissions.canReview}
		<CommonForm
			actionName="reviewPetition"
			formName="reviewPetition"
			policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
			afterConflict={endEditing}
		>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit">검토하기</button>
		</CommonForm>
	{:else if petition.status === PetitionStatus.Reviewing}
		{#if permissions.canUnreview}
			<CommonForm
				actionName="unreviewPetition"
				formName="unreviewPetition"
				policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
				afterConflict={endEditing}
			>
				<input type="hidden" name="petition-id" value={petition._id} />
				<button type="submit">검토 취소하기</button>
			</CommonForm>
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
			width: 100%;
			align-items: flex-start;
		}
	}

	.edit-button {
		margin-right: 0.6rem;
	}

	.delete-form {
		width: fit-content;
	}
</style>
