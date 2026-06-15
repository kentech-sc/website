<script lang="ts">
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';

	let { hasImage, hasFile }: { hasImage?: boolean; hasFile?: boolean } = $props();
</script>

{#if hasImage || hasFile}
	<span class="file-icons">
		{#if hasImage}
			<ImageIcon size="0.8rem" color="var(--gray-text)" />
		{/if}
		{#if hasFile}
			<FileTextIcon size="0.8rem" color="var(--gray-text)" />
		{/if}
	</span>
{/if}

<style>
	.file-icons {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}
</style>
