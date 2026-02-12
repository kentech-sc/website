<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { Types } from 'mongoose';

	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';

	import CommonForm from '$components/CommonForm.svelte';

	import * as CommonUtils from '$lib/common/utils.js';

	import * as PetitionService from '$lib/srv/petition.srv.js';
	import * as UserService from '$lib/srv/user.srv.js';

	import type { Petition } from '$lib/types/petition.type.js';
	import type { User } from '$lib/types/user.type.js';

	let {
		petition = $bindable<Petition>(),
		signersNames = $bindable<string[]>(),
		user
	}: { petition: Petition; signersNames: string[]; user: User } = $props();

	let formResult = $state<ActionResult | null>(null);

	let signed = $derived<boolean>(petition.signedBy.includes(user._id));

	$effect(() => {
		if (formResult?.type === 'success') {
			const updatedPetition = JSON.parse(formResult.data?.petition ?? '{}');
			petition.status = updatedPetition.status;
			if (updatedPetition.signCnt > petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy.push(user._id);
				const displayName = UserService.createDisplayName(user, 'realName');
				signersNames.push(displayName);
			} else if (updatedPetition.signCnt < petition.signCnt) {
				petition.signCnt = updatedPetition.signCnt;
				petition.signedBy = petition.signedBy.filter(
					(id) => !new Types.ObjectId(id).equals(user._id)
				);
				const displayName = UserService.createDisplayName(user, 'realName');
				signersNames = signersNames.filter((name) => name !== displayName);
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
	{:else}
		<CommonForm
			actionName={signed ? 'unsignPetition' : 'signPetition'}
			formName={signed ? 'unsignPetition' : 'signPetition'}
			bind:formResult
		>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container" id="sign-btn">
				<ThumbsUp size="1.2rem" color="skyblue" fill={signed ? 'skyblue' : 'transparent'} />
				<span>{petition.signCnt}</span>
			</button>
		</CommonForm>
	{/if}
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
				{petition.petitionerName} | {CommonUtils.parseDate(petition.createdAt)} | 조회수: {petition.viewCnt}
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

<section class="container-col module">
	<article>
		{@render ArticleHeader()}
		<hr />
		<pre>{@html petition.content}</pre>
		{@render SignBtn()}
	</article>
</section>

<style lang="scss">
	article {
		width: stretch;

		header > div {
			width: stretch;
			align-items: flex-start;
		}
	}

	.delete-form {
		width: fit-content;
	}

	#sign-btn {
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.5rem;
		padding: 0.15rem 0.5rem;
		width: fit-content;
		margin-top: 0.5rem;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
