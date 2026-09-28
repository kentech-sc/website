<script lang="ts">
	import type GraduationCap from '@lucide/svelte/icons/graduation-cap';
	let {
		icon: Icon,
		title,
		description
	}: { icon: typeof GraduationCap; title: string; description?: string } = $props();
</script>

<span>
	<Icon size="1rem" aria-hidden="true" />
	<span>
		<strong>{title}</strong>
		{#if description}<small>{description}</small>{/if}
	</span>
</span>

<style lang="scss">
	span {
		display: inline-flex;
		align-items: center;
		min-width: 0;
	}
	span:has(> span) {
		gap: 0.8rem;
	}
	span > span {
		flex-direction: column;
		align-items: flex-start;
	}
	small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.7rem;
	}
	span :global(svg) {
		flex-shrink: 0;
		color: var(--secondary);
	}
	strong {
		font-weight: 700;
		font-size: 0.9rem;
	}
</style>
