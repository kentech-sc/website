<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Course } from '$lib/courseReview/type';

	let { data } = $props();
	const courseArr = $state<Course[]>(JSON.parse(data?.courseArr || '[]'));
	let errorMsg = $state<string>('');

	function handleEnhance() {
		return async ({
			result,
			update,
			action
		}: {
			result: ActionResult;
			update: () => Promise<void>;
			action: URL;
		}) => {
			if (result.type === 'success' && action.search === '?/createCourse') {
				courseArr.unshift(JSON.parse(result.data?.course ?? '{}'));
				await update();
			} else if (result.type === 'failure') {
				errorMsg = result.data?.message || '알 수 없는 오류가 발생했습니다.';
			} else if (result.type === 'error') {
				errorMsg = result.error?.message || '알 수 없는 오류가 발생했습니다.';
			}
		};
	}
</script>

<h1>Course Review</h1>

<div class="container-col">
	{#each courseArr as course (course._id)}
		<div class="container">
			<a href={`/review/${course._id}`}>
				<h2>[{course.title}]</h2>
				<p>Content: {course.content}</p>
				<p>Professor: {course.professor}</p>
				<p>Score: {course.totalScore}</p>
				<p>Review Count: {course.reviewCnt}</p>
				<p>Avg.: {Math.round((course.totalScore / course.reviewCnt) * 100) / 100}</p>
			</a>
		</div>
		<hr />
	{/each}
</div>

<hr />

<form
	method="post"
	action="?/createCourse"
	class="container-col"
	data-sveltekit-replacestate
	use:enhance={handleEnhance}
>
	<label for="title">Title</label>
	<input type="text" name="title" />
	<label for="content">Content</label>
	<textarea name="content"></textarea>
	<label for="professor">Professor</label>
	<input type="text" name="professor" />
	<button type="submit">Submit</button>
</form>

{#if errorMsg}
	<p>{errorMsg}</p>
{/if}

<style>
</style>
