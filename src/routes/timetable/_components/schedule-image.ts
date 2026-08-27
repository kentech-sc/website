import { tick } from 'svelte';

export async function downloadScheduleElementAsPng(
	element: HTMLElement,
	filename: string
): Promise<void> {
	const { toPng } = await import('html-to-image');
	await tick();

	const panelRect = element.getBoundingClientRect();
	const lastContent = element.lastElementChild;
	const bottomBorder = Number.parseFloat(getComputedStyle(element).borderBottomWidth) || 0;
	const captureHeight =
		lastContent instanceof HTMLElement
			? Math.ceil(lastContent.getBoundingClientRect().bottom - panelRect.top + bottomBorder)
			: Math.ceil(panelRect.height);
	const dataUrl = await toPng(element, {
		pixelRatio: 2,
		height: captureHeight,
		filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-image-exclude'))
	});

	if (window.matchMedia('(pointer: coarse)').matches) {
		const blob = await (await fetch(dataUrl)).blob();
		const file = new File([blob], filename, { type: 'image/png' });
		if (navigator.canShare?.({ files: [file] })) {
			await navigator.share({ files: [file], title: filename });
			return;
		}
	}

	const link = document.createElement('a');
	link.href = dataUrl;
	link.download = filename;
	link.click();
}
