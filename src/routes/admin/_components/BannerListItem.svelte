<script lang="ts">
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { Banner } from '$lib/types/banner.type.js';

	import InlineActionForm from '$components/InlineActionForm.svelte';
	let {
		banner,
		index,
		dragging,
		onDragOver,
		onDragStart,
		onDragEnd,
		onKeydown
	}: {
		banner: Banner;
		index: number;
		dragging: boolean;
		onDragOver: (event: DragEvent) => void;
		onDragStart: () => void;
		onDragEnd: () => void;
		onKeydown: (event: KeyboardEvent) => void;
	} = $props();
</script>

<li
	class="banner-item"
	class:active={banner.isActive}
	class:dragging
	ondragover={onDragOver}
	ondrop={(event) => event.preventDefault()}
>
	<!-- 항목 전체가 아니라 손잡이만 끌 수 있게 해, 버튼·링크를 누를 때 드래그가 시작되지 않게 한다. -->
	<span
		class="handle"
		role="button"
		tabindex="0"
		draggable="true"
		data-handle-id={banner.id}
		aria-label="{index + 1}번째. 끌거나 위아래 방향키로 순서 바꾸기"
		ondragstart={(event) => {
			onDragStart();
			event.dataTransfer?.setData('text/plain', banner.id);
			// 손잡이만 따라다니면 무엇을 옮기는지 안 보여서, 항목 전체를 끄는 모습으로 보여준다.
			const item = (event.currentTarget as HTMLElement).closest('li');
			if (item && event.dataTransfer) event.dataTransfer.setDragImage(item, 16, 16);
		}}
		ondragend={onDragEnd}
		onkeydown={onKeydown}
	>
		<GripVertical size="0.9rem" />
	</span>
	<span class="order">{index + 1}</span>
	<img src={banner.imagePath} alt={banner.imageAlt} />

	<div class="banner-meta">
		{#if banner.linkUrl}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 관리자가 입력한 외부 주소 -->
			<a href={banner.linkUrl} target="_blank" rel="noreferrer noopener" class="ellipsis">
				{banner.linkUrl}
			</a>
		{:else}
			<span class="hint">링크 없음</span>
		{/if}
	</div>

	<div class="banner-actions">
		<InlineActionForm
			actionName="setBannerActive"
			policy="reload"
			buttonClass={banner.isActive ? 'ui-button is-secondary' : 'ui-button is-primary'}
			hiddenFields={[
				{ name: 'banner-id', value: banner.id },
				{ name: 'is-active', value: String(!banner.isActive) }
			]}
		>
			{#if banner.isActive}
				<EyeOff size="0.8rem" />
				<span>끄기</span>
			{:else}
				<Eye size="0.8rem" />
				<span>켜기</span>
			{/if}
		</InlineActionForm>
		<InlineActionForm
			actionName="removeBanner"
			policy="reload"
			buttonClass="ui-button is-danger"
			confirmMessage="이 배너를 삭제할까요? 되돌릴 수 없습니다."
			hiddenFields={[{ name: 'banner-id', value: banner.id }]}
		>
			<Trash2 size="0.8rem" />
			<span>삭제</span>
		</InlineActionForm>
	</div>
</li>

<style lang="scss">
	.banner-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.4rem;

		img {
			flex-shrink: 0;
			border-radius: 0.3rem;
			width: 6rem;
			height: 1.8rem;
			object-fit: cover;
		}
	}
	.banner-item:not(.active) img {
		opacity: 0.45;
	}
	.banner-item.active {
		border-color: var(--secondary);
		background-color: var(--secondary-bg);
	}
	.banner-meta {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		font-size: 0.75rem;
	}
	.banner-actions {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.7rem;
	}
	.handle {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		cursor: grab;
		border-radius: 0.2rem;
		color: var(--secondary-text);

		&:active {
			cursor: grabbing;
		}

		&:focus-visible {
			outline: var(--control-border-width) solid var(--secondary);
		}
	}
	.order {
		flex-shrink: 0;
		width: 1rem;
		color: var(--secondary-text);
		font-size: 0.75rem;
		text-align: center;
	}
	.banner-item.dragging {
		opacity: 0.4;
		border-style: dashed;
	}
	.hint {
		color: var(--secondary-text);
		font-size: 0.7rem;
	}
</style>
