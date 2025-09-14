<script lang="ts">
	import { page } from '$app/state';
	import type { ActionResult } from '@sveltejs/kit';
	import GeneralUtils from '$lib/general/utils.js';

	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import type { Petition } from '$lib/petition/types.js';
	import CommonForm from '$lib/assets/commonForm.svelte';

	import PetitionService from '$lib/petition/service';
	import UserService from '$lib/user/service';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let petition = $state<Petition>(JSON.parse(data?.petition || '{}'));
	let signersNames = $state<string[]>(JSON.parse(data?.signersNames || '[]'));

	let isEditing = $state<boolean>(false);

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const updatedPetition = JSON.parse(formResult.data?.petition ?? '{}');
			petition.status = updatedPetition.status;
			if (updatedPetition.signCnt > petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy.push(user._id);
				const displayName = UserService.fillDisplayName(user, 'realName');
				signersNames.push(displayName);
			} else if (updatedPetition.signCnt < petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy = petition.signedBy.filter((id) => id.toString() !== user._id.toString());
				const displayName = UserService.fillDisplayName(user, 'realName');
				signersNames = signersNames.filter((name) => name !== displayName);
			} else {
				isEditing = false;
				petition.answeredAt = updatedPetition.answeredAt;
				petition.response = updatedPetition.response;
				petition.responderId = updatedPetition.responderId;
				const displayName = UserService.fillDisplayName(user, 'realName');
				petition.responderName = updatedPetition.responderId ? displayName : null;
			}
		}
	});
</script>

{#snippet SignBtn()}
	{#if petition.petitionerId === user._id}
		<button
			type="submit"
			class="container"
			id="sign-btn"
			onclick={() => alert('청원을 제출한 사람은 서명할 수 없습니다.')}
		>
			<ThumbsUp size="1.2rem" color="skyblue" />
			<span>{petition.signCnt}</span>
		</button>
	{:else if !petition.signedBy.includes(user._id)}
		<CommonForm actionName="signPetition" formName="signPetition" bind:formResult>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container" id="sign-btn">
				<ThumbsUp size="1.2rem" color="skyblue" />
				<span>{petition.signCnt}</span>
			</button>
		</CommonForm>
	{:else}
		<CommonForm actionName="unsignPetition" formName="unsignPetition" bind:formResult>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container" id="sign-btn">
				<ThumbsUp size="1.2rem" color="skyblue" fill="skyblue" />
				<span>{petition.signCnt}</span>
			</button>
		</CommonForm>
	{/if}
{/snippet}

{#snippet HeaderModule()}
	<header class="container module">
		<h1>청원</h1>
		<a href="/petition">목록</a>
	</header>
{/snippet}

{#snippet ArticleHeader()}
	<header class="container">
		<div class="container-col">
			<h2>
				<b
					><span style="color: {PetitionService.colorStatus[petition.status]}"
						>[{PetitionService.translatedStatus[petition.status]}]</span
					></b
				>
				{petition.title}
			</h2>
			<p>
				{petition.petitionerName} | {GeneralUtils.parseDate(petition.createdAt)} | 조회수: {petition.viewCnt}
			</p>
		</div>
		{#if petition.petitionerId === user._id}
			<div class="delete-form">
				<CommonForm actionName="deletePetition" formName="deletePetition">
					<input type="hidden" name="petition-id" value={petition._id} />
					<button type="submit">삭제</button>
				</CommonForm>
			</div>
		{/if}
	</header>
{/snippet}

{#snippet ArticleModule()}
	<section class="container-col module">
		<article>
			{@render ArticleHeader()}
			<hr />
			<pre>{petition.content}</pre>
			{@render SignBtn()}
		</article>
	</section>
{/snippet}

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

{#snippet ResponseForm()}
	<CommonForm formName="responseToPetition" actionName="responseToPetition" bind:formResult>
		<input type="hidden" name="petition-id" value={petition._id} />
		<label for="response">답변</label>
		<textarea id="response" name="response"></textarea>
		<br />
		<button type="submit">답변하기</button>
	</CommonForm>
{/snippet}

{#snippet ResponseArticle()}
	<article>
		<header class="container">
			<div class="container-col">
				<h2>[답변] {petition.title}</h2>
				<p>
					{petition.responderName} | {GeneralUtils.parseDate(petition.answeredAt!)}
				</p>
			</div>
			{#if petition.responderId === user._id}
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

{#snippet EditForm()}
	<CommonForm formName="editResponse" actionName="editResponse" bind:formResult>
		<input type="hidden" name="petition-id" value={petition._id} />
		<label for="response">답변</label>
		<textarea id="response" name="response">{petition.response}</textarea>
		<br />
		<button type="submit">수정하기</button>
	</CommonForm>
{/snippet}

{#snippet EditBtn()}
	{#if petition.responderId === user._id}
		<button type="submit" onclick={() => (isEditing = true)}>수정하기</button>
	{/if}
{/snippet}

{#snippet ResponseModule()}
	<section class="container-col module" id="response-section">
		{#if petition.answeredAt}
			{#if isEditing}
				{@render EditForm()}
			{:else}
				{@render ResponseArticle()}
				{@render EditBtn()}
			{/if}
		{:else if petition.status === 'pending'}
			{@render ReviewBtn()}
		{:else if petition.status === 'reviewing'}
			{@render UnreviewBtn()}
			<br />
			<hr />
			{@render ResponseForm()}
		{:else if petition.status === 'ongoing'}
			<p>30명 이상이 동의하면 학생회가 검토 후 답변합니다.</p>
		{:else if petition.status === 'expired'}
			<p>청원 기간이 만료되었습니다.</p>
		{/if}
	</section>
{/snippet}

{#snippet SignersModule()}
	<section class="container-col module">
		{#if signersNames.length === 0}
			<p>아직 서명자가 없습니다.</p>
		{:else}
			{#each signersNames as signerName, idx (idx)}
				<p><b>[{signerName}]</b> 동의합니다.</p>
			{/each}
		{/if}
	</section>
{/snippet}

{@render HeaderModule()}
{@render ArticleModule()}
{@render ResponseModule()}
{@render SignersModule()}

<style>
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

	article {
		width: stretch;

		header > div {
			align-items: flex-start;
		}

		pre {
			margin: 0.5rem;
		}
	}

	.delete-form {
		width: fit-content;
	}

	#sign-btn {
		border: solid 0.1rem black;
		border-radius: 0.5rem;
		padding: 0.1rem 0.4rem;
		width: fit-content;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
