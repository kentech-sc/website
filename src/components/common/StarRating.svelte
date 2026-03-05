<script lang="ts">
    import Star from '@lucide/svelte/icons/star';
	import StarHalf from '@lucide/svelte/icons/star-half';

    let {
        score = $bindable(0),
        interactive = false,
        onchange
    }: {
        score?: number;
        interactive?: boolean;
        onchange?: (value: number) => void;
    } = $props();

    let hoveredRating = $state(0);
    let displayRating = $derived(interactive && hoveredRating ? hoveredRating : score / 2);

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

<div class="star-rating" class:interactive onmouseleave={() => (hoveredRating = 0)}>
    {#each [1, 2, 3, 4, 5] as i}
        <div
            class="star-wrapper"
            role={interactive ? 'button' : undefined}
            tabindex={interactive ? 0 : undefined}
            aria-label={interactive ? `별점 ${i}점` : undefined}
            onmousemove={interactive ? (e) => handleMouseMove(e, i) : undefined}
            onclick={interactive ? (e) => handleClick(e, i) : undefined}
            onkeydown={interactive ? (e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent, i) : undefined}
        >
            {#if displayRating >= i}
                <Star class="star full" fill="#FFC107"/>

            {:else if displayRating >= i - 0.5}
                <Star class="star empty background"/>
                <StarHalf class="star half overlay" fill="#FFC107"/>

            {:else}
                <Star class="star empty"/>
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
        gap: 0.125rem;

        &.interactive .star-wrapper {
            cursor: pointer;
            width: 1.6rem;
            height: 1.6rem;
            transition: transform 0.1s ease;

            &:hover {
                transform: scale(1.15);
            }
        }
    }

    .star-wrapper {
        position: relative;
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(.star) {
        stroke-width: 0.125rem;
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
        margin-left: 0.5rem;
        font-size: 0.9rem;
        color: var(--secondary-text);
    }
</style>