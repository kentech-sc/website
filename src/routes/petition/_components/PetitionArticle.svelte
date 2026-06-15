<script lang="ts">
	import '$style/nmu.scss';

	import PenTool from '@lucide/svelte/icons/pen-tool';
	import Trash from '@lucide/svelte/icons/trash-2';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Petition, PetitionPermissions } from '$lib/types/petition.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonArticleHeader from '$components/CommonArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';

	let {
		petition,
		user,
		permissions
	}: { petition: Petition; user: User; permissions: PetitionPermissions } = $props();

	let signed = $derived<boolean>(petition.signedBy.includes(user._id));
</script>

{#snippet SignButton()}
	{#if permissions.canSign || permissions.canUnsign}
		<InlineActionForm
			actionName={signed ? 'unsignPetition' : 'signPetition'}
			buttonClass="container sign-btn"
			hiddenFields={[{ name: 'petition-id', value: petition._id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
		>
			<PenTool size="1rem" color="var(--secondary)" fill={signed ? 'skyblue' : 'transparent'} />
			{#if signed}
				<span>취소하기</span>
			{:else}
				<span>서명하기</span>
			{/if}
			<!-- <span>{petition.signedBy.length}</span> -->
		</InlineActionForm>
	{/if}
{/snippet}

{#snippet ActionGroup()}
	{#if permissions.canDelete}
		<div class="delete-form">
			<InlineActionForm
				actionName="deletePetition"
				buttonClass="inline-container"
				hiddenFields={[{ name: 'petition-id', value: petition._id }]}
				policy={{ kind: 'detail', notFoundRedirectTo: '/petition' }}
			>
				<Trash size="1.2rem" />
			</InlineActionForm>
		</div>
	{/if}
{/snippet}

<section class="container-col module">
	<article>
		<CommonArticleHeader type="petition" item={petition}>
			{@render ActionGroup()}
		</CommonArticleHeader>
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(petition.content)}</pre>
		{@render SignButton()}
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
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		font-size: 0.9rem;
	}
</style>
