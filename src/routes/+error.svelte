<script lang="ts">
	import { page } from '$app/state';

	let error = $derived(JSON.parse(page.error?.message ?? '{}'));
</script>

<div>
	<h1>{error.message}</h1>
	<p>{error.stack}</p>
</div>
