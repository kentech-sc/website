<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';

	import type { Banner } from '$lib/types/banner.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { uploadFiles } from '$lib/client/file-upload.js';

	let { banners }: { banners: Banner[] } = $props();

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
		alert('배너가 변경되었습니다.');
	}
</script>

<div class="banner-manager container-col">
	<h4>
		<ImageIcon size="0.8rem" />
		<span>메인 배너</span>
	</h4>

	<!--
		각 배너의 버튼은 InlineActionForm(자체 form)이라 아래 업로드 폼 안에 넣을 수 없다.
		그래서 목록을 업로드 폼 바깥에 두고, 버튼을 해당 항목 안에 붙인다.
	-->
	{#if banners.length}
		<ul class="banner-list">
			{#each banners as banner (banner.id)}
				<li class="banner-item" class:active={banner.isActive}>
					<img src={banner.imagePath} alt={banner.imageAlt} />

					<div class="banner-meta">
						<span class="ellipsis">
							{#if banner.isActive}<em>사용 중</em>{/if}
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
						{#if !banner.isActive}
							<InlineActionForm
								actionName="activateBanner"
								formName="activateBanner"
								policy="reload"
								buttonClass="success-btn"
								hiddenFields={[{ name: 'banner-id', value: banner.id }]}
							>
								<Check size="0.8rem" />
								<span>걸기</span>
							</InlineActionForm>
						{/if}
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
	{:else}
		<div class="info">
			<p>보관함이 비어 있습니다. 이미지를 올리면 바로 메인에 걸립니다.</p>
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
			<span>올리고 바로 걸기</span>
		</button>
	</div>
</CommonForm>

<style lang="scss">
	.banner-manager {
		gap: 0.3rem;
		width: 100%;
	}

	h4 {
		width: 100%;
		font-weight: 500;
		font-size: 1rem;
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
