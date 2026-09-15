<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import ImageIcon from '@lucide/svelte/icons/image';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';

	import type { Banner } from '$lib/types/banner.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { uploadFiles } from '$lib/client/file-upload.js';

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

	let fileInput = $state<HTMLInputElement | null>(null);
	let uploadedFileId = $state('');
	let uploadedName = $state('');
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);

	async function handleFileChange() {
		const file = fileInput?.files?.[0];
		if (!file) return;

		uploading = true;
		uploadError = null;
		uploadedFileId = '';

		try {
			const result = await uploadFiles([file]);
			const uploaded = result.uploaded[0];

			if (!uploaded) {
				uploadError = '이미지를 올리지 못했습니다.';
				return;
			}

			uploadedFileId = uploaded.id;
			uploadedName = uploaded.name;
		} catch {
			uploadError = '이미지를 올리지 못했습니다.';
		} finally {
			uploading = false;
		}
	}

	function handleSuccess() {
		alert('배너를 올렸습니다.');
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
				<li
					class="banner-item"
					class:active={banner.isActive}
					class:dragging={draggingId === banner.id}
					ondragover={(event) => handleDragOver(event, index)}
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
							draggingId = banner.id;
							event.dataTransfer?.setData('text/plain', banner.id);
							// 손잡이만 따라다니면 무엇을 옮기는지 안 보여서, 항목 전체를 끄는 모습으로 보여준다.
							const item = (event.currentTarget as HTMLElement).closest('li');
							if (item && event.dataTransfer) event.dataTransfer.setDragImage(item, 16, 16);
						}}
						ondragend={() => (draggingId = null)}
						onkeydown={(event) => handleHandleKeydown(event, banner.id, index)}
					>
						<GripVertical size="0.9rem" />
					</span>
					<span class="order">{index + 1}</span>
					<img src={banner.imagePath} alt={banner.imageAlt} />

					<div class="banner-meta">
						<span class="ellipsis">
							{#if banner.isActive}<em>표시 중</em>{/if}
							{banner.imageAlt}
						</span>
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
							formName="setBannerActive"
							policy="reload"
							buttonClass={banner.isActive ? '' : 'success-btn'}
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
							formName="removeBanner"
							policy="reload"
							buttonClass="error-btn"
							confirmMessage="이 배너를 삭제할까요? 되돌릴 수 없습니다."
							hiddenFields={[{ name: 'banner-id', value: banner.id }]}
						>
							<Trash2 size="0.8rem" />
							<span>삭제</span>
						</InlineActionForm>
					</div>
				</li>
			{/each}
		</ul>

		{#if orderChanged}
			<CommonForm actionName="reorderBanners" formName="reorderBanners" policy="reload">
				<div class="order-bar">
					<span class="hint">순서가 바뀌었습니다. 저장해야 메인에 반영됩니다.</span>
					<input
						type="hidden"
						name="banner-ids"
						value={orderedBanners.map((banner) => banner.id).join(',')}
					/>
					<button type="button" onclick={() => (draftIds = null)}>
						<RotateCcw size="0.8rem" />
						<span>되돌리기</span>
					</button>
					<button type="submit" class="success-btn">
						<Check size="0.8rem" />
						<span>순서 저장</span>
					</button>
				</div>
			</CommonForm>
		{/if}
	{:else}
		<div class="info">
			<p>보관함이 비어 있습니다. 이미지를 올리면 바로 메인에 나옵니다.</p>
		</div>
	{/if}
</div>

<CommonForm
	actionName="addBanner"
	formName="addBanner"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<CommonLabel labelFor="banner-image" labelString="배너 이미지">
			<input
				type="file"
				id="banner-image"
				accept="image/*"
				bind:this={fileInput}
				onchange={handleFileChange}
			/>
		</CommonLabel>

		<p class="hint">
			가로가 긴 이미지를 권장합니다 (예: 1200 × 200). 좁은 화면에서는 좌우가 잘리므로 핵심 내용은
			가운데에 두세요.
		</p>

		{#if uploading}
			<p class="hint">이미지를 올리는 중…</p>
		{:else if uploadError}
			<p class="upload-error">{uploadError}</p>
		{:else if uploadedFileId}
			<p class="hint">올린 이미지: {uploadedName}</p>
		{/if}

		<CommonLabel labelFor="banner-link" labelString="링크 (선택)">
			<input type="url" name="link-url" id="banner-link" placeholder="https://" />
		</CommonLabel>

		<input type="hidden" name="file-id" value={uploadedFileId} />

		<button type="submit" class="warn-btn" disabled={!uploadedFileId || uploading}>
			<Upload size="0.8rem" />
			<span>올리고 바로 켜기</span>
		</button>
	</div>
</CommonForm>

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
		font-size: 1rem;

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

	// 꺼진 배너는 흐리게 해 슬라이드에 안 나온다는 걸 보인다.
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

		em {
			margin-right: 0.3rem;
			color: var(--secondary);
			font-style: normal;
			font-weight: bold;
		}
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

	// 끌고 있는 항목은 자리만 남긴 채 흐리게 보여, 어디에 놓일지 알 수 있게 한다.
	.banner-item.dragging {
		opacity: 0.4;
		border-style: dashed;
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

	.upload-error {
		width: 100%;
		color: var(--error);
		font-size: 0.7rem;
	}

	button[type='submit'] {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
