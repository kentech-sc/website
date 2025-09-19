<script lang="ts">
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';
	import ReviewForm from '../reviewForm.svelte';

	let { data } = $props();
	let courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	let professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>
{/snippet}

{@render HeaderModule()}

<section class="module">
	<p>(대충 주의사항)</p>
</section>

<section class="container-col module" id="form-section">
	<ReviewForm {professors} {courses} />
</section>

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
</style>
