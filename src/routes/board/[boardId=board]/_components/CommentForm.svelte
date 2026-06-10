<script lang="ts">
	import type { DisplayType, User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import { createDisplayName } from '$lib/shared/utils.js';
	import { DisplayType as DisplayTypeValue } from '$lib/types/user.type.js';

	let { user }: { user: User } = $props();

	let displayType = $state<DisplayType>(DisplayTypeValue.Anonymous);
	let commentTextarea = $state<HTMLTextAreaElement | null>(null);

	function clearCommentTextarea() {
		if (commentTextarea) {
			commentTextarea.value = '';
		}
	}
</script>

<CommonForm
	actionName="createComment"
	formName="createComment"
	policy="reload"
	afterSuccess={clearCommentTextarea}
>
	<div class="comment-form container-col">
		<div class="container">
			<span><b>[{createDisplayName(user, displayType)}]</b></span>
		</div>
		<div class="display-type-row container">
			<label for="anonymous">익명</label>
			<input
				type="radio"
				id="anonymous"
				name="displayType"
				value={DisplayTypeValue.Anonymous}
				checked
				bind:group={displayType}
			/>
			<label for="nickname">별명</label>
			<input
				type="radio"
				id="nickname"
				name="displayType"
				value={DisplayTypeValue.Nickname}
				bind:group={displayType}
			/>
			<label for="realName">실명</label>
			<input
				type="radio"
				id="realName"
				name="displayType"
				value={DisplayTypeValue.RealName}
				bind:group={displayType}
			/>
		</div>
		<div class="container">
			<textarea name="content" autocomplete="off" bind:this={commentTextarea}></textarea>
			<button type="submit" class="btn-action">작성</button>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.comment-form {
		justify-content: space-between;
		width: 100%;
		padding: 0.2rem;

		label {
			word-break: keep-all;
		}

		& > div {
			width: 100%;
			justify-content: flex-start;
			margin-bottom: 0.6rem;
		}

		input:not([type='radio']),
		textarea {
			padding: 0.6rem;
			font-size: 1rem;
			width: 100%;
		}

		textarea {
			resize: vertical;
		}

		button {
			margin-left: 0.6rem;
		}
	}

	.display-type-row {
		justify-content: flex-start;

		input {
			margin-left: 0.6rem;
			margin-right: 1.6rem;
		}
	}
</style>
