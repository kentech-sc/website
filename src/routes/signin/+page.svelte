<script lang="ts">
	import { onDestroy } from 'svelte';

	import GoogleModule from './_components/GoogleModule.svelte';

	let googleBusy = $state(false);
	let googleBusyTimer: ReturnType<typeof setTimeout> | null = null;

	function handleGoogleClickCapture(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.closest('button')) return;

		if (googleBusy) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		googleBusy = true;
		if (googleBusyTimer) clearTimeout(googleBusyTimer);
		googleBusyTimer = setTimeout(() => {
			googleBusy = false;
			googleBusyTimer = null;
		}, 5000);
	}

	onDestroy(() => {
		if (googleBusyTimer) clearTimeout(googleBusyTimer);
	});
</script>

<section class="container-col module">
	<h2>켄텍 이메일로 로그인 후 이용 가능합니다.</h2>
	<div
		class="google-login-shell"
		data-busy={googleBusy ? 'true' : 'false'}
		aria-busy={googleBusy ? 'true' : 'false'}
		onclickcapture={handleGoogleClickCapture}
	>
		<GoogleModule />
		{#if googleBusy}
			<div class="google-login-blocker" aria-hidden="true"></div>
		{/if}
	</div>
</section>

<style lang="scss">
	h2 {
		font-weight: 600;
		font-size: 1.2rem;
		margin-bottom: 0.6rem;
	}

	.google-login-shell {
		display: inline-flex;
		position: relative;
	}

	.google-login-shell[data-busy='true'] {
		opacity: 0.7;
		cursor: wait;
	}

	.google-login-blocker {
		position: absolute;
		cursor: wait;
		inset: 0;
	}

	section {
		margin-top: 2rem;
		width: 100%;
		height: 50vh;
	}
</style>
