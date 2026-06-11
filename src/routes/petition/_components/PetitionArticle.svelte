<script lang="ts">
	import '$style/nmu.scss';

	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Petition, PetitionPermissions } from '$lib/types/petition.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import { parseDate } from '$lib/shared/utils.js';
	import { colorStatus, translatedStatus } from '$lib/shared/view.js';

	let {
		petition,
		user,
		permissions
	}: { petition: Petition; user: User; permissions: PetitionPermissions } = $props();

	let signed = $derived<boolean>(petition.signedBy.includes(user._id));
</script>

{#snippet SignButton()}
	{#if permissions.canSign || permissions.canUnsign}
		<CommonForm
			actionName={signed ? 'unsignPetition' : 'signPetition'}
			formName={signed ? 'unsignPetition' : 'signPetition'}
			policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
		>
			<input type="hidden" name="petition-id" value={petition._id} />
			<button type="submit" class="container sign-button">
				<ThumbsUp size="1rem" color="skyblue" fill={signed ? 'skyblue' : 'transparent'} />
				<span>{petition.signedBy.length}</span>
			</button>
		</CommonForm>
	{:else}
		<div class="container sign-button" aria-disabled="true">
			<ThumbsUp size="1rem" color="skyblue" />
			<span>{petition.signedBy.length}</span>
		</div>
	{/if}
{/snippet}

<section class="container-col module">
	<article>
		<header class="container">
			<div class="container-col">
				<h2>
					<b
						><span style="color: {colorStatus[petition.status]}"
							>[{translatedStatus[petition.status]}]</span
						></b
					>
					{petition.title}
				</h2>
				<p>{petition.petitionerName} | {parseDate(petition.createdAt)} | 조회 {petition.viewCnt}</p>
			</div>
			{#if permissions.canDelete}
				<div class="delete-form">
					<CommonForm
						actionName="deletePetition"
						formName="deletePetition"
						policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
					>
						<input type="hidden" name="petition-id" value={petition._id} />
						<button type="submit">삭제</button>
					</CommonForm>
				</div>
			{/if}
		</header>
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(petition.content)}</pre>
		{@render SignButton()}
	</article>
</section>

<style lang="scss">
	article {
		width: 100%;

		header > div {
			width: 100%;
			align-items: flex-start;
		}

		pre :global(img) {
			max-width: 100%;
		}
	}

	.delete-form {
		width: fit-content;

		button {
			font-weight: bold;
		}
	}

	.sign-button {
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		margin-top: 0.6rem;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
