<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { User } from '$lib/types/user.type.js';

	import ActionForm from '$components/ActionForm.svelte';
	import AuthorNameSelector from '$components/AuthorNameSelector.svelte';

	let { user }: { user: User } = $props();

	let commentTextarea = $state<HTMLTextAreaElement | null>(null);

	function clearCommentTextarea() {
		if (commentTextarea) {
			commentTextarea.value = '';
		}
	}
</script>

<section class="module">
	<ActionForm
		actionName="createComment"
		formName="createComment"
		policy="reload"
		afterSuccess={clearCommentTextarea}
	>
		<header>
			<AuthorNameSelector {user} />
			<button type="submit" class="ui-button is-primary"><Pencil size="0.8rem" />작성</button>
		</header>
		<textarea
			name="content"
			aria-label="댓글 내용"
			placeholder="댓글을 입력하세요."
			autocomplete="off"
			bind:this={commentTextarea}></textarea>
	</ActionForm>
</section>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.8rem;
	}
	textarea {
		padding: 0.4rem 0.6rem;
		width: 100%;
		resize: vertical;
		font-size: 0.9rem;
	}
</style>
