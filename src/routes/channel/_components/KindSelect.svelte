<script lang="ts">
	import ChoiceTabs from '$components/ChoiceTabs.svelte';
	import { SUBMISSION_KIND_LABELS } from '$lib/shared/submission.js';
	import {
		SubmissionKind,
		type SubmissionKind as SubmissionKindType
	} from '$lib/types/submission.type.js';

	let { value = $bindable<SubmissionKindType>(SubmissionKind.Inquiry) } = $props();

	const options = [SubmissionKind.Inquiry, SubmissionKind.Suggestion].map((kind) => ({
		value: kind,
		label: SUBMISSION_KIND_LABELS[kind]
	}));
</script>

<ChoiceTabs name="kind" {options} bind:value />
