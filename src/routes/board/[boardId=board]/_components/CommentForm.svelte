<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';

	import type { User } from '$lib/types/user.type.js';
	import { DisplayType } from '$lib/types/user.type.js';

	import * as UserService from '$lib/srv/user.srv.js';

	import CommonForm from '$components/CommonForm.svelte';

	let { user }: { user: User } = $props();

	let commentFormResult = $state<ActionResult | null>(null);
	let displayType = $state<DisplayType>(DisplayType.Anonymous);
	let commentTextarea = $state<HTMLTextAreaElement | null>(null);

	$effect(() => {
		if (commentFormResult?.type === 'success') {
			if (commentFormResult.data?.comment && commentTextarea) {
				commentTextarea.value = '';
			}
			invalidateAll();
		}
	});
</script>

{#snippet RadioModule()}
	<div class="container" id="radio-div">
		<label for="anonymous">익명</label>
		<input
			type="radio"
			id="anonymous"
			name="displayType"
			value={DisplayType.Anonymous}
			checked
			bind:group={displayType}
		/>
		<label for="nickname">별명</label>
		<input
			type="radio"
			id="nickname"
			name="displayType"
			value={DisplayType.Nickname}
			bind:group={displayType}
		/>
		<label for="realName">실명</label>
		<input
			type="radio"
			id="realName"
			name="displayType"
			value={DisplayType.RealName}
			bind:group={displayType}
		/>
	</div>
{/snippet}

<CommonForm actionName="createComment" formName="createComment" bind:formResult={commentFormResult}>
	<div id="comment-form-div" class="container-col">
		<div class="container">
			<span><b>[{UserService.fillDisplayName(user, displayType)}]</b></span>
		</div>
		{@render RadioModule()}
		<div class="container">
			<textarea name="content" autocomplete="off" bind:this={commentTextarea}></textarea>
			<button type="submit">작성</button>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	#comment-form-div {
		justify-content: space-between;
		width: stretch;

		padding: 0.25rem;

		label {
			word-break: keep-all;
		}

		& > div {
			width: stretch;
			justify-content: flex-start;
			margin-bottom: 0.5rem;
		}

		input:not([type='radio']),
		textarea {
			padding: 0.5rem;
			font-size: 1rem;
			width: stretch;
		}

		textarea {
			resize: vertical;
		}

		button {
			margin-left: 0.5rem;
		}

		#radio-div {
			justify-content: flex-start;

			input {
				margin-left: 0.5rem;
				margin-right: 1.5rem;
			}
		}
	}
</style>
