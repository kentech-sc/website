<script lang="ts">
	import { enhance } from '$app/forms';

	let errorMsg = $state<string>('');
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>청원</h1>
		<a href="/petition">목록</a>
	</header>

	<section class="module">
		<p>(대충 주의사항)</p>
	</section>

	<section class="container module">
		<form
			method="post"
			action="?/createPetition"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance
		>
			<label for="title">제목</label>
			<input type="text" id="title" name="title" />

			<label for="content">내용</label>
			<textarea id="content" name="content"></textarea>
			<button type="submit">작성</button>
		</form>

		{#if errorMsg}
			<p>{errorMsg}</p>
		{/if}
	</section>
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
		input:not([type='radio']),
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
