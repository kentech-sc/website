<script lang="ts">
	import { enhance } from '$app/forms';

	let errorMsg = $state<string>('');
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board">목록</a>
	</header>

	<section class="module">
		<p>(대충 주의사항)</p>
	</section>

	<section class="container module">
		<form
			method="post"
			action="?/createPost"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance
		>
			<div class="container" id="radio-div">
				<label for="anonymous">익명</label>
				<input type="radio" id="anonymous" name="displayType" value="anonymous" checked />
				<label for="nickname">별명</label>
				<input type="radio" id="nickname" name="displayType" value="nickname" />
				<label for="realName">실명</label>
				<input type="radio" id="realName" name="displayType" value="realName" />
			</div>

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

	#radio-div {
		margin-bottom: 0.5rem;

		label {
			word-break: keep-all;
		}
		input {
			margin-left: 0.25rem;
			margin-right: 2rem;
		}
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
