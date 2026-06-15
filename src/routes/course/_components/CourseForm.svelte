<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import type { ActionResult } from '@sveltejs/kit';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

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
		<div class="course-form container-col">
			<CommonLabel labelFor="courseId" labelString="강의 코드">
				<input
					type="text"
					id="courseId"
					name="courseId"
					placeholder="예: EF1001"
					bind:this={courseIdInput}
				/>
			</CommonLabel>

			<CommonLabel labelFor="courseName" labelString="강의명">
				<input
					type="text"
					id="courseName"
					name="name"
					placeholder="예: 공학 미적분학 I"
					bind:this={courseNameInput}
				/>
			</CommonLabel>

			<CommonLabel labelFor="courseContent" labelString="강의 내용">
				<textarea
					id="courseContent"
					name="content"
					class="course-description"
					placeholder="강의에 대한 간단한 설명을 입력해 주세요"
					bind:this={courseContentInput}
				></textarea>
			</CommonLabel>

			<button type="submit" class="action-btn">
				<Plus size="0.8rem" />추가하기
			</button>
		</div>
	</CommonForm>

	{#if formResult?.type === 'success'}
		<p class="success">강의가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	section {
		gap: 0.6rem;
	}

	.course-form {
		gap: 0.6rem;
	}

	.course-description {
		min-height: 16rem;
	}

	.action-btn {
		margin-left: auto;
	}
</style>
