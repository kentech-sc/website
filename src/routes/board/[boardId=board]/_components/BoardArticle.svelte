<script lang="ts">
	import '$style/nmu.scss';
	import type { ActionResult } from '@sveltejs/kit';

	import type { Post } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';
	import { BOARD_CONFIG } from '$lib/types/board.type.js';
	import type { BoardId } from '$lib/types/board.type.js';

	import * as CommonUtils from '$lib/common/utils.js';

	import CommonForm from '$components/CommonForm.svelte';
	import Permission from '../../../_components/Permission.svelte';
	import PdfViewer from '$components/PdfViewer.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Message from '@lucide/svelte/icons/message-circle';
	import Heart from '@lucide/svelte/icons/heart';
	import DOMPurify from 'isomorphic-dompurify';

	let {
		post = $bindable<Post>(),
		user,
		pdfFiles = []
	}: { post: Post; user: User; pdfFiles?: FileMeta[] } = $props();

	const config = $derived(BOARD_CONFIG[post.boardId as BoardId]);

	let likeFormResult = $state<ActionResult | null>(null);

	let liked = $derived<boolean>(post.likedBy.includes(user._id));

	$effect(() => {
		if (likeFormResult?.type === 'success') {
			const updatedPost = JSON.parse(likeFormResult.data?.post ?? '{}');
			if (updatedPost.likeCnt > post.likeCnt) {
				post.likedBy.push(user._id);
			} else if (updatedPost.likeCnt < post.likeCnt) {
				post.likedBy = post.likedBy.filter((id) => id !== user._id);
			}
			post.likeCnt = updatedPost.likeCnt;
		}
	});
</script>

{#snippet LikeBtn()}
	<CommonForm
		actionName={liked ? 'unlikePost' : 'likePost'}
		formName={liked ? 'unlikePost' : 'likePost'}
		bind:formResult={likeFormResult}
	>
		<input type="hidden" name="post-id" value={post._id} />
		<button type="submit" class="container" id="like-btn">
			<Heart size="1.2rem" color="red" fill={liked ? 'red' : 'transparent'} />
			<span>{post.likeCnt}</span>
		</button>
	</CommonForm>
{/snippet}

{#snippet BtnGroup()}
	<div class="container">
		<a href="{post._id}/edit" class="btn-anchor">수정</a>
		<div class="delete-post-form">
			<CommonForm actionName="deletePost" formName="deletePost">
				<input type="hidden" name="post-id" value={post._id} />
				<button type="submit">삭제</button>
			</CommonForm>
		</div>
	</div>
{/snippet}

{#snippet ArticleHeader()}
	<header class="container">
		<div class="container-col">
			<h2>{post.title}</h2>
			<p>{post.displayName}</p>
			<p>
				<span
					><Clock size="1rem" color="var(--gray-text)" />{CommonUtils.parseDate(
						post.createdAt
					)}</span
				>
				<span><Eye size="1rem" color="var(--gray-text)" />{post.viewCnt}</span>
				<span><Message size="1rem" color="var(--gray-text)" />{post.commentCnt}</span>
				{#if config.allowLikes}
					<span><Heart size="1rem" color="var(--gray-text)" />{post.likeCnt}</span>
				{/if}
			</p>
		</div>
		<Permission {user} ownerId={post.userId} minRole="moderator">{@render BtnGroup()}</Permission>
	</header>
{/snippet}

<section class="container-col module">
	<article>
		{@render ArticleHeader()}
		{#if !config.autoPdfPreview || post.content.trim()}
			<hr />
			<!-- eslint-disable svelte/no-at-html-tags -->
			<pre class="nmu">{@html DOMPurify.sanitize(post.content)}</pre>
		{/if}
		{#if config.autoPdfPreview && pdfFiles.length > 0}
			{#if !post.content.trim()}
				<hr />
			{/if}
			{#each pdfFiles as file (file._id)}
				<div class="pdf-file-header">
					<span class="pdf-filename">{file.name}</span>
					<a href={file.path} download={file.name} class="pdf-download">다운로드</a>
				</div>
				<PdfViewer pdfKey={file.key} />
			{/each}
		{/if}
		{#if config.allowLikes}
			{@render LikeBtn()}
		{/if}
	</article>
</section>

<style lang="scss">
	article {
		width: stretch;

		header > div {
			align-items: flex-start;
			padding-bottom: 0.5rem;

			p:last-child {
				display: flex;
				align-items: center;
				gap: 1rem;
				color: var(--gray-text);
				font-size: 0.8rem;

				span {
					display: flex;
					align-items: center;
					gap: 0.2rem;
				}
			}

			h2 + p {
				line-height: 250%;
			}
		}

		pre {
			line-height: 150%;
		}

		.delete-post-form {
			width: fit-content;
		}

		pre :global(img) {
			max-width: 100%;
		}
	}

	header {
		width: stretch;
		justify-content: space-between;
	}

	.pdf-file-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0;
		margin-bottom: 0.25rem;
		font-size: 0.85rem;
		color: var(--gray-text);

		.pdf-download {
			color: var(--secondary);
			text-decoration: none;
			font-size: 0.8rem;
			border: solid 0.05rem var(--gray-border);
			border-radius: 0.3rem;
			padding: 0.1rem 0.5rem;
			flex-shrink: 0;

			&:hover {
				background-color: var(--secondary-bg);
			}
		}
	}

	#like-btn {
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.5rem;
		padding: 0.15rem 0.5rem;
		width: fit-content;
		margin-top: 0.5rem;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
