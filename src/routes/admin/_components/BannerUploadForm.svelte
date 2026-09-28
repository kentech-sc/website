<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';
	import { uploadFiles } from '$lib/client/file-upload.js';

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
			const uploaded = (await uploadFiles([file])).uploaded[0];
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
</script>

<ActionForm
	actionName="addBanner"
	formName="addBanner"
	policy="reload"
	afterSuccess={() => alert('배너를 올렸습니다.')}
>
	<div class="settings-form">
		<FormField inputId="banner-image" label="배너 이미지">
			<input
				type="file"
				id="banner-image"
				accept="image/*"
				bind:this={fileInput}
				onchange={handleFileChange}
			/>
		</FormField>
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
		<FormField inputId="banner-link" label="링크 (선택)">
			<input type="url" name="link-url" id="banner-link" placeholder="https://" />
		</FormField>
		<input type="hidden" name="file-id" value={uploadedFileId} />
		<button type="submit" class="ui-button is-primary" disabled={!uploadedFileId || uploading}>
			<Upload size="0.8rem" />
			<span>올리고 바로 켜기</span>
		</button>
	</div>
</ActionForm>

<style lang="scss">
	.hint,
	.upload-error {
		width: 100%;
		font-size: 0.7rem;
	}
	.hint {
		color: var(--secondary-text);
	}
	.upload-error {
		color: var(--error);
	}
</style>
