<script lang="ts">
	import ImageIcon from '@lucide/svelte/icons/image';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';

	import type { Banner } from '$lib/types/banner.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { uploadFiles } from '$lib/client/file-upload.js';

	let { banner }: { banner: Banner | null } = $props();

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

<CommonForm
	actionName="setBanner"
	formName="setBanner"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<h4>
			<ImageIcon size="0.8rem" />
			<span>메인 배너</span>
		</h4>

		{#if banner}
			<div class="current">
				<img src={banner.imagePath} alt={banner.imageAlt} />
				<div class="current-meta">
					<span class="ellipsis">{banner.imageAlt}</span>
					{#if banner.linkUrl}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 관리자가 입력한 외부 주소 -->
						<a href={banner.linkUrl} target="_blank" rel="noreferrer noopener" class="ellipsis">
							{banner.linkUrl}
						</a>
					{:else}
						<span class="muted">링크 없음</span>
					{/if}
				</div>
			</div>
		{:else}
			<div class="info">
				<p>지금 걸려 있는 배너가 없습니다.</p>
			</div>
		{/if}

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
			<input
				type="url"
				name="link-url"
				id="banner-link"
				placeholder="https://"
				value={banner?.linkUrl ?? ''}
			/>
		</CommonLabel>

		<input type="hidden" name="file-id" value={uploadedFileId} />

		<button type="submit" class="warn-btn" disabled={!uploadedFileId || uploading}>
			<Upload size="0.8rem" />
			<span>배너 걸기</span>
		</button>
	</div>
</CommonForm>

{#if banner}
	<div class="remove">
		<InlineActionForm actionName="removeBanner" buttonClass="error-btn">
			<Trash2 size="0.8rem" />
			<span>배너 내리기</span>
		</InlineActionForm>
	</div>
{/if}

<style lang="scss">
	h4 {
		width: 100%;
		font-weight: 500;
		font-size: 1rem;
	}

	.current {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.6rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.4rem;
		width: 100%;

		img {
			flex-shrink: 0;
			border-radius: 0.3rem;
			width: 7rem;
			height: 2rem;
			object-fit: cover;
		}
	}

	.current-meta {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		font-size: 0.75rem;
	}

	.info {
		justify-content: flex-start;
		margin-top: 0.6rem;
		margin-bottom: 0.2rem;
		font-size: 0.7rem;
	}

	.hint,
	.muted {
		width: 100%;
		color: var(--secondary-text);
		font-size: 0.7rem;
	}

	.upload-error {
		width: 100%;
		color: var(--error);
		font-size: 0.7rem;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}

	.remove {
		display: flex;
		justify-content: flex-end;
		width: 100%;
	}
</style>
