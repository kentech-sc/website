<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ImageIcon from '@lucide/svelte/icons/image';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	import BannerListItem from './BannerListItem.svelte';
	import BannerUploadForm from './BannerUploadForm.svelte';

	import type { Banner } from '$lib/types/banner.type.js';

	import ActionForm from '$components/ActionForm.svelte';

	let { banners }: { banners: Banner[] } = $props();

	// 드래그로 바꾼 순서. 저장하기 전까지는 화면에서만 바뀐다.
	// 서버 목록이 새로 내려오면(켜기/삭제/업로드 후) 다시 서버 순서를 따른다.
	let draftIds = $state<string[] | null>(null);
	let draggingId = $state<string | null>(null);

	const serverIds = $derived(banners.map((banner) => banner.id));
	const orderedBanners = $derived.by(() => {
		if (!draftIds) return banners;
		const byId = new Map(banners.map((banner) => [banner.id, banner]));
		// 저장 전에 목록이 바뀌었으면 사라진 건 빼고, 새로 생긴 건 뒤에 붙인다.
		const kept = draftIds.flatMap((id) => byId.get(id) ?? []);
		const added = banners.filter((banner) => !draftIds?.includes(banner.id));
		return [...kept, ...added];
	});
	const orderChanged = $derived(
		orderedBanners.some((banner, index) => banner.id !== serverIds[index])
	);

	$effect(() => {
		// 서버 목록이 바뀌면 임시 순서를 버린다.
		void serverIds;
		draftIds = null;
	});

	function moveTo(bannerId: string, targetIndex: number) {
		const ids = orderedBanners.map((banner) => banner.id);
		const from = ids.indexOf(bannerId);
		if (from === -1 || targetIndex < 0 || targetIndex >= ids.length || from === targetIndex) return;

		ids.splice(from, 1);
		ids.splice(targetIndex, 0, bannerId);
		draftIds = ids;
	}

	function handleDragOver(event: DragEvent, targetIndex: number) {
		if (!draggingId) return;
		event.preventDefault();
		// 올라간 항목 자리로 바로 옮겨 놓아, 놓기 전에 결과가 미리 보이게 한다.
		moveTo(draggingId, targetIndex);
	}

	// 마우스를 못 쓰는 경우를 위해 손잡이에서 위/아래 방향키로도 옮긴다.
	function handleHandleKeydown(event: KeyboardEvent, bannerId: string, index: number) {
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
		event.preventDefault();
		moveTo(bannerId, event.key === 'ArrowUp' ? index - 1 : index + 1);

		// 다시 그려진 뒤에도 같은 손잡이에 포커스를 둬야 연달아 옮길 수 있다.
		requestAnimationFrame(() => {
			document.querySelector<HTMLElement>(`[data-handle-id="${bannerId}"]`)?.focus();
		});
	}
</script>

<div class="banner-manager container-col">
	<h4>
		<ImageIcon size="0.8rem" />
		<span>메인 배너</span>
		<small>켜진 배너가 위에서부터 차례로 넘어갑니다. 끌어서 순서를 바꾸세요</small>
	</h4>

	<!--
		각 배너의 버튼은 InlineActionForm(자체 form)이라 아래 업로드 폼 안에 넣을 수 없다.
		그래서 목록을 업로드 폼 바깥에 두고, 버튼을 해당 항목 안에 붙인다.
	-->
	{#if banners.length}
		<ul class="banner-list">
			{#each orderedBanners as banner, index (banner.id)}
				<BannerListItem
					{banner}
					{index}
					dragging={draggingId === banner.id}
					onDragOver={(event) => handleDragOver(event, index)}
					onDragStart={() => (draggingId = banner.id)}
					onDragEnd={() => (draggingId = null)}
					onKeydown={(event) => handleHandleKeydown(event, banner.id, index)}
				/>
			{/each}
		</ul>

		{#if orderChanged}
			<ActionForm actionName="reorderBanners" formName="reorderBanners" policy="reload">
				<div class="order-bar">
					<span class="hint">순서가 바뀌었습니다. 저장해야 메인에 반영됩니다.</span>
					<input
						type="hidden"
						name="banner-ids"
						value={orderedBanners.map((banner) => banner.id).join(',')}
					/>
					<button type="button" class="ui-button is-secondary" onclick={() => (draftIds = null)}>
						<RotateCcw size="0.8rem" />
						<span>되돌리기</span>
					</button>
					<button type="submit" class="ui-button is-primary">
						<Check size="0.8rem" />
						<span>순서 저장</span>
					</button>
				</div>
			</ActionForm>
		{/if}
	{:else}
		<div class="info">
			<p>보관함이 비어 있습니다. 이미지를 올리면 바로 메인에 나옵니다.</p>
		</div>
	{/if}
</div>

<BannerUploadForm />

<style lang="scss">
	.banner-manager {
		gap: 0.3rem;
		width: 100%;
	}

	h4 {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		width: 100%;
		font-weight: 500;
		font-size: 0.9rem;

		small {
			margin-left: auto;
			color: var(--secondary-text);
			font-weight: normal;
			font-size: 0.7rem;
		}
	}

	.banner-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin: 0.3rem 0 0;
		padding: 0;
		width: 100%;
		list-style: none;
	}

	.order-bar {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		margin-top: 0.3rem;
		width: 100%;
		font-size: 0.7rem;

		.hint {
			flex: 1;
			width: auto;
		}
	}

	.info {
		justify-content: flex-start;
		margin-top: 0.3rem;
		font-size: 0.7rem;
	}

	.hint {
		width: 100%;
		color: var(--secondary-text);
		font-size: 0.7rem;
	}
</style>
