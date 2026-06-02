<script lang="ts">
	import { onMount, tick } from 'svelte';
	// 워커를 Vite가 번들링하도록 위임 → pdfjs-dist 버전과 자동 동기화 (static 벤더링 불필요)
	import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

	let { pdfKey }: { pdfKey: string } = $props();

	let loading = $state(true);
	let errorMsg = $state<string | null>(null);
	let pageCount = $state(0);
	let renderedCount = $state(0);
	let pageNums = $state<number[]>([]);
	let canvases: (HTMLCanvasElement | null)[] = $state([]);

	onMount(async () => {
		try {
			const pdfjsLib = await import('pdfjs-dist');
			pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

			const proxyUrl = `/api/pdf?key=${encodeURIComponent(pdfKey)}`;
			const pdf = await pdfjsLib.getDocument({ url: proxyUrl }).promise;
			pageCount = pdf.numPages;
			pageNums = Array.from({ length: pdf.numPages }, (_, i) => i + 1);

			await tick();

			for (let i = 0; i < pdf.numPages; i++) {
				const canvas = canvases[i];
				if (!canvas) continue;

				const page = await pdf.getPage(i + 1);
				const containerWidth = canvas.parentElement?.clientWidth || 800;
				const unscaled = page.getViewport({ scale: 1 });
				const scale = (containerWidth / unscaled.width) * window.devicePixelRatio;
				const viewport = page.getViewport({ scale });

				canvas.height = viewport.height;
				canvas.width = viewport.width;

				await page.render({ canvas, viewport }).promise;
				renderedCount = i + 1;
			}

			loading = false;
		} catch {
			errorMsg = '문서를 불러오는 데 실패했습니다.';
			loading = false;
		}
	});
</script>

<div class="pdf-wrapper">
	{#if loading && !errorMsg}
		<div class="pdf-status">
			{#if pageCount > 0}
				{renderedCount} / {pageCount} 페이지 로딩 중…
			{:else}
				문서 불러오는 중…
			{/if}
		</div>
	{/if}
	{#if errorMsg}
		<div class="pdf-status error">{errorMsg}</div>
	{/if}
	{#each pageNums as num, i (num)}
		<canvas bind:this={canvases[i]} class="pdf-page" class:hidden={loading && !errorMsg}></canvas>
	{/each}
</div>

<style lang="scss">
	.pdf-wrapper {
		width: 100%;
		margin-top: 1.5rem;
	}

	.pdf-status {
		padding: 2rem;
		text-align: center;
		color: var(--gray-text);
		font-size: 0.9rem;

		&.error {
			color: var(--error-text);
		}
	}

	.pdf-page {
		display: block;
		width: 100%;
		margin-bottom: 0.5rem;

		&.hidden {
			display: none;
		}
	}
</style>
