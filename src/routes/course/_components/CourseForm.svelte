<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';

	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);
	let courseIdInput = $state<HTMLInputElement | null>(null);
	let courseNameInput = $state<HTMLInputElement | null>(null);
	let courseContentInput = $state<HTMLTextAreaElement | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			if (courseIdInput) courseIdInput.value = '';
			if (courseNameInput) courseNameInput.value = '';
			if (courseContentInput) courseContentInput.value = '';
		}
	});
</script>

<section class="container-col module">
	<CommonForm actionName="addCourse" formName="addCourse" bind:formResult>
		<div class="container-col">
			<label for="courseId">강의 코드</label>
			<input
				type="text"
				id="courseId"
				name="courseId"
				placeholder="예: EF1001"
				bind:this={courseIdInput}
			/>
			<label for="name">강의명</label>
			<input type="text" id="name" name="name" placeholder="예: 공학 미적분학 I" bind:this={courseNameInput} />
			<label for="content">강의 내용</label>
			<textarea
				id="content"
				name="content"
				placeholder="강의에 대한 간략한 설명을 입력하세요"
				bind:this={courseContentInput}
			></textarea>
			<div class="form-actions">
				<button type="submit" class="btn-action">추가하기</button>
			</div>
		</div>
	</CommonForm>
	{#if formResult?.type === 'success'}
		<p>강의가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		label {
			font-weight: bold;
			margin-bottom: 0.5rem;
		}

		input,
		textarea {
			width: 100%;
			margin-bottom: 0.5rem;
		}

		textarea {
			height: 50vh;
			resize: vertical;
		}

		.form-actions {
			width: 100%;
			display: flex;
			justify-content: flex-end;
		}

		.btn-action {
			padding: 0.4rem 1.2rem;
			font-size: 0.9rem;
		}
	}
</style>
