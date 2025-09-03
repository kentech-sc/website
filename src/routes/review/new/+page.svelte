<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';

	let { data } = $props();
	let courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	let professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));

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
			action="?/createReview"
			class="container-col"
			data-sveltekit-replacestate
			use:enhance
		>
			<label for="courseId">강의 코드</label>
			<select id="courseId" name="courseId">
				<option value="">선택</option>
				{#each courses as course (course._id)}
					<option value={course._id}>[{course.code}] {course.name}</option>
				{/each}
			</select>
			<label for="professorId">교수님</label>
			<select id="professorId" name="professorId">
				<option value="">선택</option>
				{#each professors as professor (professor._id)}
					<option value={professor._id}>{professor.name} 교수님</option>
				{/each}
			</select>
			<label for="score">점수</label>
			<input type="number" id="score" name="score" />
			<label for="comment">한줄평</label>
			<textarea id="comment" name="comment"></textarea>
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
