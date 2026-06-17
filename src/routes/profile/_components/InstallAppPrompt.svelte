<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Share from '@lucide/svelte/icons/share';
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	};

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let canPromptInstall = $state(false);
	let showIosGuide = $state(false);
	let showGuidePanel = $state(false);
	let isInstalled = $state(false);
	let isReady = $state(false);

	function isIosDevice(): boolean {
		const userAgent = navigator.userAgent;
		const platform = navigator.platform;
		const hasTouchPoints = navigator.maxTouchPoints > 1;

		return /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && hasTouchPoints);
	}

	function updateInstalledState(mediaQueryList: MediaQueryList) {
		const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

		isInstalled =
			mediaQueryList.matches ||
			navigatorWithStandalone.standalone === true ||
			document.referrer.startsWith('android-app://');

		showIosGuide = isIosDevice() && !isInstalled;

		if (isInstalled) {
			canPromptInstall = false;
			deferredPrompt = null;
			showGuidePanel = false;
		}
	}

	async function promptInstall() {
		if (!deferredPrompt) return;

		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;

		deferredPrompt = null;
		canPromptInstall = false;

		if (choice.outcome === 'accepted') {
			showGuidePanel = false;
		}
	}

	function toggleGuidePanel() {
		showGuidePanel = !showGuidePanel;
	}

	onMount(() => {
		const mediaQueryList = window.matchMedia('(display-mode: standalone)');
		const handleDisplayModeChange = () => updateInstalledState(mediaQueryList);
		const handleBeforeInstallPrompt = (event: Event) => {
			const promptEvent = event as BeforeInstallPromptEvent;

			promptEvent.preventDefault();
			deferredPrompt = promptEvent;
			canPromptInstall = !isInstalled;
		};
		const handleAppInstalled = () => updateInstalledState(mediaQueryList);

		updateInstalledState(mediaQueryList);
		isReady = true;

		mediaQueryList.addEventListener('change', handleDisplayModeChange);
		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			mediaQueryList.removeEventListener('change', handleDisplayModeChange);
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	});
</script>

{#if isReady && !isInstalled && (canPromptInstall || showIosGuide)}
	<div class="install-prompt">
		{#if canPromptInstall}
			<button type="button" class="install-btn" onclick={promptInstall}>
				<Download size="0.8rem" />
				<span class="label">앱 설치</span>
			</button>
		{:else if showIosGuide}
			<button type="button" class="install-btn" onclick={toggleGuidePanel} aria-expanded={showGuidePanel}>
				<Share size="0.8rem" />
				<span class="label">설치 안내</span>
			</button>
		{/if}

		{#if showGuidePanel}
			<div class="guide-panel">
				<div class="guide-header">
					<strong>앱 설치</strong>
					<button type="button" class="close-btn" onclick={() => (showGuidePanel = false)}>
						<X size="0.8rem" />
					</button>
				</div>
				<p>브라우저 메뉴의 공유 버튼을 누른 뒤 홈 화면에 추가를 선택해 주세요.</p>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.install-prompt {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.install-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;

		border-color: oklch(from var(--white) calc(l - 0.12) c h);
		background-color: var(--white);
		padding: 0.2rem 0.5rem;
		color: var(--tertiary);
		font-weight: 700;
		font-size: 0.7rem;
		white-space: nowrap;

		&:hover {
			background-color: var(--white-hover);
		}
	}

	.guide-panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		box-shadow: 0 0.3rem 1rem oklch(0 0 0 / 18%);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.6rem;
		background-color: var(--white);
		padding: 0.6rem;
		width: min(16rem, calc(100vw - 1.2rem));

		color: var(--text);

		p {
			margin: 0;
			font-size: 0.7rem;
			line-height: 1.5;
			text-align: left;
		}
	}

	.guide-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;

		strong {
			font-size: 0.75rem;
		}
	}

	.close-btn {
		border: none;
		background: transparent;
		padding: 0.1rem;
		color: var(--gray-text);

		&:hover {
			background: transparent;
			color: var(--text);
		}
	}

	@media (max-width: 800px) {
		.install-btn {
			padding: 0.2rem 0.4rem;
		}

		.label {
			display: none;
		}
	}
</style>
