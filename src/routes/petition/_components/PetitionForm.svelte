<script>
	import CommonForm from '$lib/components/CommonForm.svelte';
</script>

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

<style lang="scss">
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
