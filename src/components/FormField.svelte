<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		inputId,
		label,
		children
	}: {
		inputId: string;
		label: string;
		children: Snippet;
	} = $props();
</script>

<div class="form-field">
	<label for={inputId}>{label}</label>
	{@render children()}
</div>
