<script lang="ts">
	import Bold from '@lucide/svelte/icons/bold';
	import Code from '@lucide/svelte/icons/code';
	import Code2 from '@lucide/svelte/icons/code-2';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Quote from '@lucide/svelte/icons/message-square-quote';
	import Minus from '@lucide/svelte/icons/minus';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import Upload from '@lucide/svelte/icons/upload';

	import type { Editor } from '@tiptap/core';

	let {
		editor,
		active,
		canToggleCode,
		headingLevel = $bindable(),
		fontSize = $bindable(),
		textColor = $bindable(),
		textAlign = $bindable(),
		disabled,
		uploading,
		onUploadMouseDown,
		onUpload,
		onFileChange
	}: {
		editor: Editor;
		active: Record<string, boolean>;
		canToggleCode: boolean;
		headingLevel: string;
		fontSize: string;
		textColor: string;
		textAlign: string;
		disabled: boolean;
		uploading: boolean;
		onUploadMouseDown: (event: MouseEvent) => void;
		onUpload: (input: HTMLInputElement) => void;
		onFileChange: (event: Event) => void;
	} = $props();

	let fileInput = $state<HTMLInputElement>();
</script>

<fieldset class="editor-toolbar" {disabled} aria-label="본문 서식">
	<select
		bind:value={headingLevel}
		onchange={(event) => {
			const level = Number(event.currentTarget.value);
			const chain = editor.chain().focus();
			if (level) chain.setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
			else chain.setParagraph().run();
		}}
		aria-label="문단 유형"
	>
		<option value="">본문</option>
		{#each [1, 2, 3, 4, 5, 6] as level (level)}<option value={level}>제목 {level}</option>{/each}
	</select>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleBold().run()}
		class:is-active={active.bold}
		aria-pressed={active.bold ?? false}
		aria-label="굵게"><Bold size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleItalic().run()}
		class:is-active={active.italic}
		aria-pressed={active.italic ?? false}
		aria-label="기울임"><Italic size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleStrike().run()}
		class:is-active={active.strike}
		aria-pressed={active.strike ?? false}
		aria-label="취소선"><Strikethrough size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleUnderline().run()}
		class:is-active={active.underline}
		aria-pressed={active.underline ?? false}
		aria-label="밑줄"><UnderlineIcon size="0.8rem" /></button
	>
	<select
		bind:value={fontSize}
		onchange={(event) =>
			editor
				.chain()
				.focus()
				.setFontSize((event.target as HTMLSelectElement).value || '16px')
				.run()}
		aria-label="글자 크기"
	>
		{#each [12, 14, 16, 18, 20, 24, 32] as size (size)}<option value="{size}px">{size}px</option
			>{/each}
	</select>
	<input
		type="color"
		bind:value={textColor}
		onchange={(event) =>
			editor
				.chain()
				.focus()
				.setColor((event.target as HTMLInputElement).value)
				.run()}
		title="글자 색상"
	/>
	<select
		bind:value={textAlign}
		onchange={(event) =>
			editor
				.chain()
				.focus()
				.setTextAlign((event.target as HTMLSelectElement).value)
				.run()}
		aria-label="문단 정렬"
	>
		<option value="left">왼쪽 정렬</option><option value="center">가운데 정렬</option><option
			value="right">오른쪽 정렬</option
		><option value="justify">양쪽 정렬</option>
	</select>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleBulletList().run()}
		class:is-active={active.bulletList}
		aria-pressed={active.bulletList ?? false}
		aria-label="글머리 기호"><List size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleOrderedList().run()}
		class:is-active={active.orderedList}
		aria-pressed={active.orderedList ?? false}
		aria-label="번호 목록"><ListOrdered size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleCode().run()}
		disabled={!canToggleCode}
		class:is-active={active.code}
		aria-pressed={active.code ?? false}
		aria-label="인라인 코드"><Code size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleCodeBlock().run()}
		class:is-active={active.codeBlock}
		aria-pressed={active.codeBlock ?? false}
		aria-label="코드 블록"><Code2 size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().toggleBlockquote().run()}
		class:is-active={active.blockquote}
		aria-pressed={active.blockquote ?? false}
		aria-label="인용"><Quote size="0.8rem" /></button
	>
	<button
		type="button"
		onclick={() => editor.chain().focus().setHorizontalRule().run()}
		aria-label="구분선"><Minus size="0.8rem" /></button
	>
	<input
		type="file"
		multiple
		accept=".jpg,.jpeg,.png,.apng,.webp,.pdf,.docx,.xlsx"
		bind:this={fileInput}
		{disabled}
		onchange={onFileChange}
		hidden
	/>
	<button
		type="button"
		disabled={disabled || uploading}
		onmousedown={onUploadMouseDown}
		onclick={() => fileInput && onUpload(fileInput)}
		aria-label="파일 업로드"><Upload size="0.8rem" /></button
	>
</fieldset>

<style lang="scss">
	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		box-shadow: 0 0.2rem 0.4rem var(--shadow-color);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.4rem 0.4rem 0 0;
		background: var(--gray-bg);
		padding: 0.25rem;
	}
	button,
	select,
	input[type='color'] {
		cursor: pointer;
		border: 0.05rem solid var(--gray-border);
		border-radius: 0.2rem;
		background: var(--white);
		color: var(--text);
	}
	button {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	button:hover,
	button.is-active {
		background: var(--gray-hover);
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	select {
		padding: 0;
		height: auto;
		font-size: 0.7rem;
	}
	input[type='color'] {
		padding: 0 0.25rem;
		width: 2rem;
		height: auto;
	}
</style>
