<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import StarHalf from '@lucide/svelte/icons/star-half';

	let {
		score = $bindable(0),
		interactive = false,
		disabled = false,
		onchange
	}: {
		score?: number;
		interactive?: boolean;
		disabled?: boolean;
		onchange?: (value: number) => void;
	} = $props();

	let hoveredRating = $state(0);
	let isInteractive = $derived(interactive && !disabled);
	let displayRating = $derived(isInteractive && hoveredRating ? hoveredRating : score / 2);

	function handleMouseMove(e: MouseEvent, starIndex: number) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		hoveredRating = e.clientX - rect.left < rect.width / 2 ? starIndex - 0.5 : starIndex;
	}

	function handleClick(e: MouseEvent, starIndex: number) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const newRating = e.clientX - rect.left < rect.width / 2 ? starIndex - 0.5 : starIndex;
		score = newRating * 2;
		onchange?.(score);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="star-rating"
	class:interactive={isInteractive}
	data-disabled={disabled ? 'true' : 'false'}
	onmouseleave={() => (hoveredRating = 0)}
>
	{#each [1, 2, 3, 4, 5] as i (i)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="star-wrapper"
			role={isInteractive ? 'button' : undefined}
			tabindex={isInteractive ? 0 : undefined}
			aria-label={isInteractive ? `별점 ${i}점` : undefined}
			aria-disabled={disabled ? 'true' : undefined}
			onmousemove={isInteractive ? (e) => handleMouseMove(e, i) : undefined}
			onclick={isInteractive ? (e) => handleClick(e, i) : undefined}
			onkeydown={isInteractive
				? (e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent, i)
				: undefined}
		>
			{#if displayRating >= i}
				<Star class="star full" fill="#FFC107" />
			{:else if displayRating >= i - 0.5}
				<Star class="star empty background" />
				<StarHalf class="star half overlay" fill="#FFC107" />
			{:else}
				<Star class="star empty" />
			{/if}
		</div>
	{/each}
	{#if !interactive}
		<span class="score-text">({score})</span>
	{/if}
</div>

<style lang="scss">
	.star-rating {
		display: inline-flex;
		align-items: center;
		gap: 0.1rem;

		&[data-disabled='true'] {
			opacity: 0.7;
			cursor: wait;
		}

		&.interactive .star-wrapper {
			transition: transform 0.1s ease;
			cursor: pointer;
			width: 1.6rem;
			height: 1.6rem;

			&:hover {
				transform: scale(1.15);
			}
		}
	}

	.star-wrapper {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		width: 1rem;
		height: 1rem;
	}

	:global(.star) {
		stroke-width: 0.1rem;
		width: 100%;
		height: 100%;
	}

	:global(.star.empty) {
		stroke: var(--secondary-text);
	}

	:global(.star.background) {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}

	:global(.star.overlay) {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
	}

	.score-text {
		margin-left: 0.4rem;
		color: var(--gray);
		font-size: 0.8rem;
	}
</style>
