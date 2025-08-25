<script lang="ts">
	import { enhance } from '$app/forms';
	let errorMsg = $state<string>('');
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
			action="?/createCourse"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance
		>
			<label for="title">강의명</label>
			<input type="text" id="title" name="title" />
			<label for="professor">교수님</label>
			<input type="text" id="professor" name="professor" />
			<label for="content">강의 내용</label>
			<textarea id="content" name="content"></textarea>
			<button type="submit">추가하기</button>
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
