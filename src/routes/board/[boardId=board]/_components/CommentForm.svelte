<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import DisplayTypeSelector from '$components/DisplayTypeSelector.svelte';

	let { user }: { user: User } = $props();

	let commentTextarea = $state<HTMLTextAreaElement | null>(null);

	function clearCommentTextarea() {
		if (commentTextarea) {
			commentTextarea.value = '';
		}
	}
</script>

<section class="module container-col">
	<CommonForm
		actionName="createComment"
		formName="createComment"
		policy="reload"
		afterSuccess={clearCommentTextarea}
	>
		<div class="comment-form container-col">
			<div class="container">
				<DisplayTypeSelector {user} />
				<button type="submit" class="action-btn"><Pencil size="0.8rem" />작성</button>
			</div>
			<textarea name="content" placeholder="댓글을 입력하세요." autocomplete="off" bind:this={commentTextarea}></textarea>
		</div>
	</CommonForm>
</section>

<style lang="scss">

	section {
		gap: .8rem;
	}

	.comment-form {
		gap: 0.8rem;

		& > div {
			justify-content: space-between;
			width: 100%;
		}

		textarea {
			padding: 0.4rem 0.6rem;
			width: 100%;
			resize: vertical;
			font-size: 0.9rem;
		}
	}
</style>
