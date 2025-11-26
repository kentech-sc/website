<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
	import GeneralUtils from '$lib/common/utils.js';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Petition } from '$lib/petition/types.js';
	import type { User } from '$lib/user/types.js';
	import UserService from '$lib/user/service';

	let { petition = $bindable<Petition>(), user }: { petition: Petition; user: User } = $props();

	let isEditing = $state<boolean>(false);
	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const updatedPetition = JSON.parse(formResult.data?.petition ?? '{}');
			petition.status = updatedPetition.status;
			isEditing = false;
			petition.answeredAt = updatedPetition.answeredAt;
			petition.response = updatedPetition.response;
			petition.responderId = updatedPetition.responderId;
			const displayName = UserService.fillDisplayName(user, 'realName');
			petition.responderName = updatedPetition.responderId ? displayName : null;
		}
	});
</script>

{#snippet ReviewBtn()}
	<CommonForm actionName="reviewPetition" formName="reviewPetition" bind:formResult>
		<input type="hidden" name="petition-id" value={petition._id} />
		<button type="submit">검토하기</button>
	</CommonForm>
{/snippet}

{#snippet UnreviewBtn()}
	<CommonForm actionName="unreviewPetition" formName="unreviewPetition" bind:formResult>
		<input type="hidden" name="petition-id" value={petition._id} />
		<button type="submit">검토 취소하기</button>
	</CommonForm>
{/snippet}

{#snippet ResponseForm(response: string | null)}
	<CommonForm
		formName={response ? 'editResponse' : 'responseToPetition'}
		actionName={response ? 'editResponse' : 'responseToPetition'}
		bind:formResult
	>
		<input type="hidden" name="petition-id" value={petition._id} />
		<label for="response">답변</label>
		<textarea id="response" name="response">{response}</textarea>
		<br />
		<button type="submit">{response ? '수정하기' : '답변하기'}</button>
	</CommonForm>
{/snippet}

{#snippet ResponseArticle()}
	<article>
		<header class="container">
			<div class="container-col">
				<h2><span style="color: purple">[답변]</span> {petition.title}</h2>
				<p>
					{petition.responderName} | {GeneralUtils.parseDate(petition.answeredAt!)}
				</p>
			</div>
			{#if petition.responderId === user._id}
				<button id="edit-btn" type="submit" onclick={() => (isEditing = true)}>수정</button>
				<div class="delete-form">
					<CommonForm actionName="deleteResponse" formName="deleteResponse" bind:formResult>
						<input type="hidden" name="petition-id" value={petition._id} />
						<button type="submit">삭제</button>
					</CommonForm>
				</div>
			{/if}
		</header>
		<hr />
		<pre>{petition.response}</pre>
	</article>
{/snippet}

<section class="container-col module" id="response-section">
	{#if petition.answeredAt}
		{#if isEditing}
			{@render ResponseForm(petition.response)}
		{:else}
			{@render ResponseArticle()}
		{/if}
	{:else if petition.status === 'pending'}
		{@render ReviewBtn()}
	{:else if petition.status === 'reviewing'}
		{@render UnreviewBtn()}
		<br />
		<hr />
		{@render ResponseForm(null)}
	{:else if petition.status === 'ongoing'}
		<p>30명 이상이 동의하면 학생회가 검토 후 답변합니다.</p>
	{:else if petition.status === 'expired'}
		<p>청원 기간이 만료되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	article {
		width: stretch;

		header > div {
			width: stretch;
			align-items: flex-start;
		}
	}

	#edit-btn {
		margin-right: 0.5rem;
	}

	.delete-form {
		width: fit-content;
	}
</style>
