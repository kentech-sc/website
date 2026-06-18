<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { onMount } from 'svelte';

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	};

	let showPcGuide = $state(false);
	let showIosGuide = $state(false);
	let showAndroidGuide = $state(false);
	let shouldShowSection = $state(false);

	let androidInstallPrompt: BeforeInstallPromptEvent | null = null;

	function isAndroidDevice(): boolean {
		return /Android/i.test(navigator.userAgent);
	}

	function isIosDevice(): boolean {
		const userAgent = navigator.userAgent;
		const platform = navigator.platform;
		const hasTouchPoints = navigator.maxTouchPoints > 1;

		return /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && hasTouchPoints);
	}

	function isPcDevice(): boolean {
		return !isIosDevice() && !isAndroidDevice();
	}

	function updateGuideState(mediaQueryList: MediaQueryList) {
		const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
		const isInstalled =
			mediaQueryList.matches ||
			navigatorWithStandalone.standalone === true ||
			document.referrer.startsWith('android-app://');

		showPcGuide = isPcDevice() && !isInstalled;
		showIosGuide = isIosDevice() && !isInstalled;
		showAndroidGuide = isAndroidDevice() && !isInstalled;
		shouldShowSection = showPcGuide || showIosGuide || showAndroidGuide;

		if (isInstalled) {
			androidInstallPrompt = null;
		}
	}

	async function promptAndroidInstall() {
		if (!androidInstallPrompt) return;

		await androidInstallPrompt.prompt();
		await androidInstallPrompt.userChoice;
		androidInstallPrompt = null;
	}

	onMount(() => {
		const mediaQueryList = window.matchMedia('(display-mode: standalone)');
		const handleDisplayModeChange = () => updateGuideState(mediaQueryList);
		const handleAppInstalled = () => updateGuideState(mediaQueryList);
		const handleBeforeInstallPrompt = (event: Event) => {
			const promptEvent = event as BeforeInstallPromptEvent;

			promptEvent.preventDefault();
			androidInstallPrompt = promptEvent;
			updateGuideState(mediaQueryList);
		};

		updateGuideState(mediaQueryList);

		mediaQueryList.addEventListener('change', handleDisplayModeChange);
		window.addEventListener('appinstalled', handleAppInstalled);
		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			mediaQueryList.removeEventListener('change', handleDisplayModeChange);
			window.removeEventListener('appinstalled', handleAppInstalled);
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	});
</script>

{#if shouldShowSection && !showPcGuide}
	<section class="container-col">
		<h4>
			<Download size="0.8rem" />
			<span>앱 설치</span>
		</h4>
		{#if showAndroidGuide}
			<p>버튼 클릭 한번으로 앱을 바로 설치할 수 있습니다.
				<br/>
				아무런 변화가 없으면 새로고침 후 다시 시도해 주세요.
			</p>
			<button
				type="button"
				class="action-btn"
				onclick={promptAndroidInstall}
			>
				<Download size="0.8rem" />
				<span>설치하기</span>
			</button>
		{:else if showIosGuide}
			<p>브라우저의 공유 버튼을 누른 뒤, 홈 화면에 추가를 선택해 주세요.</p>
		{/if}
	</section>
{/if}

<style lang="scss">
	section {
		width: 100%;
	}

	h4 {
		width: 100%;
		color: var(--secondary);
		font-weight: 500;
		font-size: 1rem;
	}

	p {
		margin-top: .2rem;
		width: 100%;
		color: var(--gray);
		font-size: 0.8rem;
	}

	button {
		margin-top: .6rem;
		margin-left: auto;
	}
</style>
