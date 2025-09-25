<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
</script>

<section class="container-col module">
	<CommonForm actionName="addCourse" formName="addCourse">
		<div class="container-col">
			<label for="code">강의 코드</label>
			<input type="text" id="code" name="code" />
			<label for="name">강의명</label>
			<input type="text" id="name" name="name" />
			<label for="content">강의 내용</label>
			<textarea id="content" name="content"></textarea>
			<button type="submit">추가하기</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		input,
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
