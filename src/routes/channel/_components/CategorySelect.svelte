<script lang="ts">
	import CommonLabel from '$components/CommonLabel.svelte';
	import { SUBMISSION_CATEGORY_LABELS } from '$lib/shared/submission.js';
	import {
		SubmissionCategory,
		type SubmissionCategory as Category
	} from '$lib/types/submission.type.js';

	let { value = $bindable<Category>(SubmissionCategory.Executive) } = $props();
</script>

<CommonLabel labelFor="category" labelString="담당 분야">
	<select id="category" name="category" bind:value>
		{#each Object.entries(SUBMISSION_CATEGORY_LABELS) as [category, label] (category)}
			<option value={category}>{label}</option>
		{/each}
	</select>
</CommonLabel>
