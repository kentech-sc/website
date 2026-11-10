<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		phase,
		courses,
		round,
		startButton,
		onCancel,
		onRegister,
		options
	}: {
		phase: 'idle' | 'loading' | 'waiting' | 'ready' | 'processing' | 'playing' | 'stopped';
		courses: string[];
		round: number;
		startButton: Snippet;
		onCancel: () => void;
		onRegister: (index: number) => void;
		options: Snippet;
	} = $props();

	let courseList = $state<HTMLDivElement>();
	const running = $derived(phase === 'waiting' || phase === 'ready' || phase === 'processing');

	$effect(() => {
		if (phase === 'waiting' && round === 0) {
			courseList?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
		}
	});
</script>

<div class="reaction-cart">
	<div bind:this={courseList}>
		<table>
			<caption>장바구니</caption>
			<tbody>
				{#each courses as course, index (course)}
					{@const available = phase === 'ready' && round === index}
					{@const complete = index < round}
					{@const label = complete ? '신청 완료' : '수강신청'}
					<tr>
						<th scope="row">{course}</th>
						<td class="course-action">
							<button
								class="register-button"
								class:is-complete={complete}
								disabled={!running || phase === 'processing' || complete}
								aria-disabled={!available}
								tabindex="-1"
								aria-label={`${course} ${label}`}
								onpointerdown={(event) => {
									if (
										!event.isTrusted ||
										event.button !== 0 ||
										!event.isPrimary ||
										!running ||
										complete
									)
										return;
									event.preventDefault();
									onRegister(index);
								}}>{label}</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="cart-footer">
		{#if !running}
			{@render options()}
		{/if}
		<div class="cart-footer-action">
			{#if running}
				<button class="ui-button is-compact cancel-game" onclick={onCancel}>중단</button>
			{:else}
				{@render startButton()}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@use './reaction-cart.scss';
</style>
