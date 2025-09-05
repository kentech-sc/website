<script lang="ts">
	import CommonForm from '$lib/assets/commonForm.svelte';
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{#snippet CourseForm()}
	<section class="container-col module">
		<CommonForm actionName="addCourse" formName="addCourse">
			<div class="form-div container-col">
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
{/snippet}

{#snippet ProfessorForm()}
	<section class="container-col module">
		<CommonForm actionName="addProfessor" formName="addProfessor">
			<div class="form-div container-col">
				<label for="name">교수님 성함</label>
				<input type="text" id="name" name="name" />
				<button type="submit">추가하기</button>
			</div>
		</CommonForm>
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
{@render CourseForm()}
{@render ProfessorForm()}

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

	.form-div {
		width: stretch;
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
