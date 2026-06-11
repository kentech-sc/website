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
		<div class="course-form">
			<div class="field-group field-group-strong">
				<label for="courseId">강의 코드</label>
				<input
					type="text"
					id="courseId"
					name="courseId"
					placeholder="예: EF1001"
					bind:this={courseIdInput}
				/>
			</div>

			<div class="field-group field-group-strong">
				<label for="courseName">강의명</label>
				<input
					type="text"
					id="courseName"
					name="name"
					placeholder="예: 공학 미적분학 I"
					bind:this={courseNameInput}
				/>
			</div>

			<div class="field-group field-group-strong">
				<label for="courseContent">강의 내용</label>
				<textarea
					id="courseContent"
					name="content"
					class="course-description"
					placeholder="강의에 대한 간단한 설명을 입력해 주세요"
					bind:this={courseContentInput}
				></textarea>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="btn-action">추가하기</button>
			</div>
		</div>
	</CommonForm>

	{#if formResult?.type === 'success'}
		<p>강의가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	.course-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.course-description {
		min-height: 20rem;
		height: 50vh;
	}

	.form-actions-end {
		margin-top: 0.4rem;
	}

	.btn-action {
		font-size: 0.9rem;
	}
</style>
