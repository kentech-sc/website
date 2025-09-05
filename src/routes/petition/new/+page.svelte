<script lang="ts">
	import CommonForm from '$lib/assets/commonForm.svelte';
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>청원</h1>
		<a href="/petition">목록</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{#snippet FormModule()}
	<section class="module">
		<CommonForm actionName="createPetition" formName="createPetition">
			<div id="form-div">
				<label for="title">제목</label>
				<input type="text" id="title" name="title" />
				<label for="content">내용</label>
				<textarea id="content" name="content"></textarea>
				<button type="submit">작성</button>
			</div>
		</CommonForm>
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
{@render FormModule()}

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

	#form-div {
		width: stretch;
		align-items: flex-start;
		input:not([type='radio']),
		textarea {
			width: stretch;
			margin-bottom: 0.5rem;
		}

		textarea {
			height: 50vh;
			resize: vertical;
		}
	}
</style>
