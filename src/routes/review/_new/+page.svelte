<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	let errorMsg = $state<string>('');

	function handleEnhance() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			console.log(result);
			if (result.type === 'failure') {
				errorMsg = result.data?.message;
			} else {
				await update();
			}
		};
	}
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>

	<section class="module">
		<p>(대충 주의사항)</p>
	</section>

	<section class="container-col module">
		<form
			method="post"
			action="?/addCourse"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance={handleEnhance}
		>
			<label for="code">강의 코드</label>
			<input type="text" id="code" name="code" />
			<label for="name">강의명</label>
			<input type="text" id="name" name="name" />
			<label for="content">강의 내용</label>
			<textarea id="content" name="content"></textarea>
			<button type="submit">추가하기</button>
		</form>
	</section>

	<section class="container-col module">
		<form
			method="post"
			action="?/addProfessor"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance={handleEnhance}
		>
			<label for="name">교수님 성함</label>
			<input type="text" id="name" name="name" />
			<button type="submit">추가하기</button>
		</form>
	</section>

	{#if errorMsg}
		<p>{errorMsg}</p>
	{/if}
</div>

<style lang="scss">
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
	form {
		width: 100%;
		align-items: flex-start;
		input,
		textarea {
			width: 100%;
			margin-bottom: 0.5rem;
		}

		textarea {
			height: 50vh;
			resize: vertical;
		}
	}
</style>
