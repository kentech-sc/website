<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import { onMount } from 'svelte';

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	};

	type WindowWithInstallPrompt = Window & {
		__deferredInstallPrompt?: BeforeInstallPromptEvent | null;
	};

	let showIosGuide = $state(false);
	let installPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let browserReady = $state(false);

	function isAndroidDevice(): boolean {
		return /Android/i.test(navigator.userAgent);
	}

	function isIosDevice(): boolean {
		const userAgent = navigator.userAgent;
		const platform = navigator.platform;
		const hasTouchPoints = navigator.maxTouchPoints > 1;

		return /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && hasTouchPoints);
	}

	function isManualInstallSupported(): boolean {
		if (!window.isSecureContext) return false;
		if (isIosDevice() || isAndroidDevice()) return true;

		const userAgent = navigator.userAgent;
		const isChromium = /(?:Edg|Chrome|Chromium)\//i.test(userAgent);
		const isDesktopSafari =
			/Safari\//i.test(userAgent) && !/(?:Chrome|Chromium|Edg)\//i.test(userAgent);

		return isChromium || isDesktopSafari;
	}

	async function promptInstall() {
		if (!installPrompt) return;

		await installPrompt.prompt();
		await installPrompt.userChoice;
		installPrompt = null;
		(window as WindowWithInstallPrompt).__deferredInstallPrompt = null;
	}

	onMount(() => {
		browserReady = true;
		showIosGuide = isIosDevice();

		const handleAppInstalled = () => {
			installPrompt = null;
		};
		const handleInstallPromptAvailable = () => {
			installPrompt = (window as WindowWithInstallPrompt).__deferredInstallPrompt ?? installPrompt;
		};

		handleInstallPromptAvailable();
		window.addEventListener('appinstalled', handleAppInstalled);
		window.addEventListener('installpromptavailable', handleInstallPromptAvailable);

		return () => {
			window.removeEventListener('appinstalled', handleAppInstalled);
			window.removeEventListener('installpromptavailable', handleInstallPromptAvailable);
		};
	});
</script>

<section class="container-col">
	<h4>
		<Download size="0.8rem" />
		<span>앱 설치</span>
	</h4>
	{#if showIosGuide}
		<p>브라우저의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택해 주세요.</p>
	{:else if installPrompt}
		<p>이 사이트를 앱으로 설치하면 홈 화면에서 바로 실행할 수 있습니다.</p>
		<button type="button" class="action-btn" onclick={promptInstall}>
			<Download size="0.8rem" />
			<span>설치하기</span>
		</button>
	{:else if !browserReady}
		<p>앱을 설치할 수 있는지 확인하고 있습니다...</p>
	{:else if isManualInstallSupported()}
		<p>
			브라우저 주소창 또는 메뉴에서 ‘앱 설치’를 선택해 주세요. 이미 설치했다면 설치된 앱을 열어
			주세요.
		</p>
	{:else}
		<div class="error">현재 브라우저 또는 접속 환경에서는 앱을 설치할 수 없습니다.</div>
	{/if}
</section>

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
		width: 100%;
		color: var(--gray);
		font-size: 0.8rem;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
