<script lang="ts">

    import Star from '@lucide/svelte/icons/star';
	import StarHalf from '@lucide/svelte/icons/star-half';

    let { score = 0 }: { score: number } = $props();

    let rating = $derived(score / 2);
</script>

<div class="star-rating">
    {#each [1, 2, 3, 4, 5] as i}
        <div class="star-wrapper">
            {#if rating >= i}
                <Star class="star full" fill="#FFC107"/>
            
            {:else if rating >= i - 0.5}
                <Star class="star empty background"/>
                <StarHalf class="star half overlay" fill="#FFC107"/>
            
            {:else}
                <Star class="star empty"/>
            {/if}
        </div>
    {/each}
    <span class="score-text">({score})</span>
</div>

<style lang="scss">
    .star-rating {
        display: inline-flex;
        align-items: center;
        gap: 0.125rem;
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