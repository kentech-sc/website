<script lang="ts">
	import { page } from '$app/state';
	import type { ActionResult } from '@sveltejs/kit';
	import GeneralUtils from '$lib/general/utils.js';

	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import type { Petition } from '$lib/petition/types.js';
	import CommonForm from '$lib/assets/commonForm.svelte';

	import PetitionService from '$lib/petition/service';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let petition = $state<Petition>(JSON.parse(data?.petition || '{}'));
	let signersNames = $state<string[]>(JSON.parse(data?.signersNames || '[]'));

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const updatedPetition = JSON.parse(formResult.data?.petition ?? '{}');
			petition.status = updatedPetition.status;
			if (updatedPetition.signCnt > petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy.push(user._id);
				signersNames.push(user.realName);
			} else if (updatedPetition.signCnt < petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy = petition.signedBy.filter((id) => id.toString() !== user._id.toString());
				signersNames = signersNames.filter((name) => name !== user.realName);
			} else {
				petition.answeredAt = updatedPetition.answeredAt;
				petition.response = updatedPetition.response;
				petition.responderName = updatedPetition.responderId ? user.realName : null;
			}
		}
	});
</script>

{#snippet SignBtn()}
	{#if !petition.signedBy.includes(user._id)}
		<CommonForm actionName="signPetition" formName="signPetition" bind:formResult>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container" id="like-btn">
				<ThumbsUp size="1.2rem" color="skyblue" />
				<span>{petition.signCnt}</span>
			</button>
		</CommonForm>
	{:else}
		<CommonForm actionName="unsignPetition" formName="unsignPetition" bind:formResult>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container" id="like-btn">
				<ThumbsUp size="1.2rem" color="skyblue" fill="skyblue" />
				<span>{petition.signCnt}</span>
			</button>
		</CommonForm>
	{/if}
{/snippet}

{#snippet ReviewBtn()}
	<CommonForm actionName="reviewPetition" formName="reviewPetition" bind:formResult>
		<input type="hidden" name="petition-id" value={petition._id} />
		<button type="submit">검토하기</button>
	</CommonForm>
{/snippet}

<div id="layout" class="container-col">
	<header class="container module">
		<h1>청원</h1>
		<a href="/petition">목록</a>
	</header>

	<section class="container-col module">
		<article>
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
					<CommonForm actionName="deletePetition" formName="deletePetition" bind:formResult>
						<input type="hidden" name="petition-id" value={petition._id} />
						<button type="submit">삭제</button>
					</CommonForm>
				{/if}
			</header>
			<hr />
			<pre>{petition.content}</pre>
			{@render SignBtn()}
		</article>
	</section>

	<section class="container-col module" id="response-section">
		{#if petition.answeredAt}
			<article>
				<header class="container">
					<div class="container-col">
						<h2>[답변] {petition.title}</h2>
						<p>
							{petition.responderName} | {GeneralUtils.parseDate(petition.answeredAt)}
						</p>
					</div>
					{#if petition.responderId === user._id}
						<CommonForm actionName="deleteResponse" formName="deleteResponse" bind:formResult>
							<input type="hidden" name="petition-id" value={petition._id} />
							<button type="submit">삭제</button>
						</CommonForm>
					{/if}
				</header>
				<hr />
				<pre>{petition.response}</pre>
			</article>
		{:else if petition.status === 'pending'}
			{@render ReviewBtn()}
		{:else}
			<CommonForm formName="responseToPetition" actionName="responseToPetition" bind:formResult>
				<input type="hidden" name="petition-id" value={petition._id} />
				<label for="response">답변</label>
				<textarea id="response" name="response"></textarea>
				<button type="submit">답변하기</button>
			</CommonForm>
		{/if}
	</section>

	<section class="container-col module">
		{#if signersNames.length === 0}
			<p>아직 서명자가 없습니다.</p>
		{:else}
			{#each signersNames as signerName, idx (idx)}
				<p><b>[{signerName}]</b> 동의합니다.</p>
			{/each}
		{/if}
	</section>
</div>

<style>
	#layout {
		width: 100%;
	}

	section {
		width: 100%;
		margin: 0.5rem;
	}

	header {
		width: 100%;
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

	#like-btn {
		border: solid 0.1rem black;
		border-radius: 0.5rem;
		padding: 0.1rem 0.4rem;
		width: fit-content;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
