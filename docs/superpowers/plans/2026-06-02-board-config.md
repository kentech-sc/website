# Board Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게시판별 댓글·좋아요·작성권한 정책을 `BOARD_CONFIG` 단일 소스로 통합하고, 공지·회칙 댓글을 비활성화한다.

**Architecture:** `lib/types/board.type.ts`에 `BOARD_CONFIG` 상수를 추가해 정책 데이터를 한 곳에 정의. 기존에 각 컴포넌트·rule에 흩어진 `boardId === 'bylaw'` 조건들을 이 config 참조로 교체. 서버 액션에도 동일 config 기반 가드를 추가해 UI 숨김과 별개로 API 레벨에서 차단.

**Tech Stack:** SvelteKit 2 · Svelte 5 · TypeScript · Sass · `npm run check` (svelte-check) · `npm run lint` (Prettier + ESLint)

> **Note:** 이 프로젝트엔 테스트 인프라가 없다. "테스트" 단계는 `npm run check`(타입 검사) + `npm run lint` + curl 스모크 테스트로 대체한다.

---

## File Map

| 파일                                                               | 변경 유형 | 내용                                                      |
| ------------------------------------------------------------------ | --------- | --------------------------------------------------------- |
| `src/lib/types/board.type.ts`                                      | **수정**  | `BOARD_CONFIG` 상수 추가                                  |
| `src/lib/rules/post.rule.ts`                                       | **수정**  | `canCreatePost` — config 참조로 교체                      |
| `src/routes/board/[boardId=board]/_components/BoardHeader.svelte`  | **수정**  | label/description/write조건 config 참조                   |
| `src/routes/board/[boardId=board]/_components/BoardArticle.svelte` | **수정**  | `allowLikes` 로 LikeBtn·하트 조건 렌더                    |
| `src/routes/board/[boardId=board]/_components/BoardList.svelte`    | **수정**  | `allowLikes` 로 좋아요 컬럼 조건 렌더                     |
| `src/routes/board/[boardId=board]/[postId]/+page.svelte`           | **수정**  | `allowComments` 로 CommentSection 조건 렌더               |
| `src/routes/board/[boardId=board]/[postId]/+page.server.ts`        | **수정**  | likePost/unlikePost/createComment/deleteComment 서버 가드 |

---

### Task 1: BOARD_CONFIG 정의

**Files:**

- Modify: `src/lib/types/board.type.ts`

- [ ] **Step 1: board.type.ts 전체를 아래로 교체**

```ts
import { UserGroup } from '$lib/types/user.type.js';

export const BoardId = {
	Notice: 'notice',
	Free: 'free',
	Bylaw: 'bylaw'
} as const;

export type BoardId = (typeof BoardId)[keyof typeof BoardId];

interface BoardConfig {
	label: string;
	description: string;
	allowComments: boolean;
	allowLikes: boolean;
	writeMinRole: UserGroup;
}

export const BOARD_CONFIG: Record<BoardId, BoardConfig> = {
	[BoardId.Notice]: {
		label: '공지사항',
		description: '학생회의 공지사항을 한눈에 확인하세요',
		allowComments: false,
		allowLikes: true,
		writeMinRole: UserGroup.Moderator
	},
	[BoardId.Free]: {
		label: '자유게시판',
		description: '구성원들과 자유로운 대화를 나눠보세요',
		allowComments: true,
		allowLikes: true,
		writeMinRole: UserGroup.User
	},
	[BoardId.Bylaw]: {
		label: '회칙·세칙',
		description: '총학생회의 회칙과 세칙을 확인하세요',
		allowComments: false,
		allowLikes: true,
		writeMinRole: UserGroup.Moderator
	}
};
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/lib/types/board.type.ts
git commit -m "feat: add BOARD_CONFIG to board.type.ts"
```

---

### Task 2: post.rule.ts — config 기반으로 교체

**Files:**

- Modify: `src/lib/rules/post.rule.ts`

- [ ] **Step 1: post.rule.ts 전체를 아래로 교체**

```ts
import type { User } from '$lib/types/user.type.js';
import type { Post, PostCreate } from '$lib/types/post.type.js';
import { BOARD_CONFIG } from '$lib/types/board.type.js';
import { hasMinRole } from '$lib/common/permission.js';

export function canEditOrDeletePost(post: Post, user: User): boolean {
	return post.userId === user._id || hasMinRole(user, 'moderator');
}

export function canCreatePost(post: PostCreate, user: User): boolean {
	return hasMinRole(user, BOARD_CONFIG[post.boardId].writeMinRole);
}
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/lib/rules/post.rule.ts
git commit -m "refactor: canCreatePost uses BOARD_CONFIG.writeMinRole"
```

---

### Task 3: BoardHeader.svelte — config 기반으로 교체

**Files:**

- Modify: `src/routes/board/[boardId=board]/_components/BoardHeader.svelte`

- [ ] **Step 1: BoardHeader.svelte 전체를 아래로 교체**

```svelte
<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';
	import { hasMinRole } from '$lib/common/permission';
	import { BOARD_CONFIG } from '$lib/types/board.type.js';
	import type { BoardId } from '$lib/types/board.type.js';

	const user = JSON.parse(page.data.user);

	let { pageType } = $props();
	const boardId = $derived(page.params.boardId as BoardId);
	const config = $derived(BOARD_CONFIG[boardId]);
</script>

<header class="container-col module_head">
	<h1>{config.label}</h1>

	<div class="container">
		<p>{config.description}</p>
		{#if pageType === 'list' && hasMinRole(user, config.writeMinRole)}
			<LinkButton href="/board/{boardId}/new">
				<Pen size="1rem" />
				<span>글쓰기</span>
			</LinkButton>
		{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
			<LinkButton href="/board/{boardId}">
				<List size="1rem" />
				<span>목록</span>
			</LinkButton>
		{/if}
	</div>
	<hr />
</header>

<style lang="scss">
	header {
		align-items: flex-start;
		width: stretch;

		div {
			width: stretch;
			justify-content: space-between;
		}
	}
</style>
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/routes/board/[boardId=board]/_components/BoardHeader.svelte
git commit -m "refactor: BoardHeader uses BOARD_CONFIG for label/description/write permission"
```

---

### Task 4: BoardArticle.svelte — allowLikes 게이팅

**Files:**

- Modify: `src/routes/board/[boardId=board]/_components/BoardArticle.svelte`

`post.boardId`를 통해 config에 접근한다.

- [ ] **Step 1: BoardArticle.svelte 전체를 아래로 교체**

```svelte
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

	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Message from '@lucide/svelte/icons/message-circle';
	import Heart from '@lucide/svelte/icons/heart';
	import DOMPurify from 'isomorphic-dompurify';

	let { post = $bindable<Post>(), user }: { post: Post; user: User } = $props();

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
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(post.content)}</pre>
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
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/routes/board/[boardId=board]/_components/BoardArticle.svelte
git commit -m "feat: gate LikeBtn and heart icon by BOARD_CONFIG.allowLikes"
```

---

### Task 5: BoardList.svelte — allowLikes 컬럼 게이팅

**Files:**

- Modify: `src/routes/board/[boardId=board]/_components/BoardList.svelte`

- [ ] **Step 1: BoardList.svelte 전체를 아래로 교체**

```svelte
<script lang="ts">
	import { page } from '$app/state';

	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';
	import MobileListItem from '$components/MobileListItem.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';

	import type { Post } from '$lib/types/post.type.js';
	import { BOARD_CONFIG } from '$lib/types/board.type.js';
	import type { BoardId } from '$lib/types/board.type.js';

	import * as CommonUtils from '$lib/common/utils.js';
	import { parseRelativeDate } from '$lib/common/utils.js';

	type FilePresence = Record<string, { hasImage: boolean; hasFile: boolean }>;
	let {
		posts,
		filePresence,
		toId,
		fromId
	}: { posts: Post[]; filePresence: FilePresence; toId?: string; fromId?: string } = $props();

	const boardId = $derived(page.params.boardId as BoardId);
	const config = $derived(BOARD_CONFIG[boardId]);
</script>

{#snippet ListItem(post: Post)}
	{@const fp = filePresence[post._id.toString()]}
	<tr>
		<td
			><a href={`/board/${boardId}/${post._id}`}
				><span class="ellipsis">{post.title}</span><FileAttachmentIcons
					hasImage={fp?.hasImage}
					hasFile={fp?.hasFile}
				/><span>[{post.commentCnt}]</span></a
			></td
		>
		<td>{post.displayName}</td>
		<td>{CommonUtils.parseDate(post.createdAt)}</td>
		<td>{post.viewCnt}</td>
		{#if config.allowLikes}
			<td>{post.likeCnt}</td>
		{/if}
	</tr>
{/snippet}

<section class="container-col module">
	<table>
		<colgroup>
			{#if config.allowLikes}
				<col style="width:60%" />
				<col style="width:12%" />
				<col style="width:16%" />
				<col style="width:6%" />
				<col style="width:6%" />
			{:else}
				<col style="width:66%" />
				<col style="width:12%" />
				<col style="width:16%" />
				<col style="width:6%" />
			{/if}
		</colgroup>
		<thead>
			<tr>
				<th>제목</th>
				<th>작성자</th>
				<th>작성일</th>
				<th>조회수</th>
				{#if config.allowLikes}
					<th>좋아요</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each posts as post (post._id)}
				{@render ListItem(post)}
			{/each}
		</tbody>
	</table>
	<CommonListBtnModule pageName="board/{boardId}" {toId} {fromId} />
</section>

<section class="container-col module mobile-list">
	{#each posts as post (post._id)}
		<MobileListItem href={`/board/${boardId}/${post._id}`}>
			{#snippet row1()}
				<span class="title">{post.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[post._id.toString()]?.hasImage}
					hasFile={filePresence[post._id.toString()]?.hasFile}
				/>
				{#if post.commentCnt > 0}<span class="comment-cnt">[{post.commentCnt}]</span>{/if}
			{/snippet}
			{#snippet row2()}
				<span class="meta">
					{post.displayName} · 조회 {post.viewCnt}{#if config.allowLikes}
						· 추천 {post.likeCnt}{/if}
				</span>
				<span class="time">{parseRelativeDate(post.createdAt)}</span>
			{/snippet}
		</MobileListItem>
	{/each}
	<CommonListBtnModule pageName="board/{boardId}" {toId} {fromId} />
</section>

<style lang="scss">
	table {
		width: stretch;

		th {
			word-break: keep-all;
		}

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		td:first-child > a {
			display: grid;
			justify-content: start;
			align-items: center;
			grid-template-columns: auto auto auto;
			gap: 0.2rem;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody {
			tr {
				border-bottom: solid var(--gray-border) 0.1rem;
			}

			tr:hover > td {
				background-color: var(--gray-bg);
			}
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}

		td:first-child {
			font-weight: bold;
			a {
				color: black;

				span:last-child {
					color: var(--secondary);
					font-size: 0.8rem;
				}
			}
		}
	}

	.mobile-list {
		display: none;
	}

	@media (max-width: 768px) {
		section:not(.mobile-list) {
			display: none;
		}

		.mobile-list {
			display: flex;
			padding: 0;

			:global(.comment-cnt) {
				flex-shrink: 0;
				color: var(--secondary);
				font-size: 0.9rem;
				font-weight: bold;
			}
		}
	}
</style>
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/routes/board/[boardId=board]/_components/BoardList.svelte
git commit -m "feat: gate likes column in BoardList by BOARD_CONFIG.allowLikes"
```

---

### Task 6: [postId]/+page.svelte — allowComments 게이팅

**Files:**

- Modify: `src/routes/board/[boardId=board]/[postId]/+page.svelte`

- [ ] **Step 1: +page.svelte 전체를 아래로 교체**

```svelte
<script lang="ts">
	import { page } from '$app/state';

	import type { Post } from '$lib/types/post.type.js';
	import type { Comment } from '$lib/types/comment.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import { BOARD_CONFIG } from '$lib/types/board.type.js';
	import type { BoardId } from '$lib/types/board.type.js';

	import BoardHeader from '../_components/BoardHeader.svelte';
	import BoardArticle from '../_components/BoardArticle.svelte';
	import CommentSection from '../_components/CommentSection.svelte';
	import FileList from '$components/FileList.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let post = $state<Post>(JSON.parse(data?.post || '{}'));
	let comments = $derived<Comment[]>(JSON.parse(data?.comments || '[]'));
	let fileMetas = $derived<Array<FileMeta>>(JSON.parse(data?.files || '[]'));

	const boardId = $derived(page.params.boardId as BoardId);
	const config = $derived(BOARD_CONFIG[boardId]);
</script>

<BoardHeader pageType="detail" />
<BoardArticle bind:post {user} />
<FileList {fileMetas} isEditing={false} />
{#if config.allowComments}
	<CommentSection authorId={post.userId} {comments} {user} />
{/if}
```

- [ ] **Step 2: 타입 검사**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/routes/board/[boardId=board]/[postId]/+page.svelte
git commit -m "feat: hide CommentSection when BOARD_CONFIG.allowComments is false"
```

---

### Task 7: 서버 액션 가드 추가

**Files:**

- Modify: `src/routes/board/[boardId=board]/[postId]/+page.server.ts`

- [ ] **Step 1: +page.server.ts 전체를 아래로 교체**

```ts
import * as PostService from '$lib/srv/post.srv.js';
import * as BoardApplication from '$lib/app/board.app.js';

import type { CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { DisplayType } from '$lib/types/user.type.js';
import { BOARD_CONFIG } from '$lib/types/board.type.js';
import type { BoardId } from '$lib/types/board.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = withLoadErrorHandling(async ({ params, request }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		await PostService.viewPostById(postId);
	}

	const { post, comments, files } = await BoardApplication.getPostDetailByPostId(postId);

	return {
		post: JSON.stringify(post),
		comments: JSON.stringify(comments),
		files: JSON.stringify(files)
	};
});

export const actions = {
	deletePost: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 게시글을 삭제할 수 없습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		await BoardApplication.deletePostById(postId, locals.user);
		redirect(302, '/board/' + params.boardId);
	}),
	likePost: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 좋아요를 누를 수 없습니다.' });
		const config = BOARD_CONFIG[params.boardId as BoardId];
		if (!config.allowLikes)
			return fail(403, { message: '이 게시판은 좋아요를 지원하지 않습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await PostService.likePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	}),
	unlikePost: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 좋아요를 취소할 수 없습니다.' });
		const config = BOARD_CONFIG[params.boardId as BoardId];
		if (!config.allowLikes)
			return fail(403, { message: '이 게시판은 좋아요를 지원하지 않습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await PostService.unlikePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	}),
	createComment: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 댓글을 작성할 수 없습니다.' });
		const config = BOARD_CONFIG[params.boardId as BoardId];
		if (!config.allowComments)
			return fail(403, { message: '이 게시판은 댓글을 지원하지 않습니다.' });

		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();

		if (!content) return fail(400, { message: 'content is required' });

		const displayTypeRaw = (formData.get('displayType') ?? '').toString();

		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType))
			return fail(400, { message: 'displayType is invalid' });

		const displayType = displayTypeRaw as DisplayType;

		const comment = await BoardApplication.createCommentAndUpdatePost(
			postId,
			content,
			locals.user._id,
			displayType
		);

		return { comment: JSON.stringify(comment) };
	}),
	deleteComment: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 댓글을 삭제할 수 없습니다.' });
		const config = BOARD_CONFIG[params.boardId as BoardId];
		if (!config.allowComments)
			return fail(403, { message: '이 게시판은 댓글을 지원하지 않습니다.' });
		const formData = await request.formData();
		const commentIdRaw = (formData.get('comment-id') ?? '').toString();
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		await BoardApplication.deleteCommentAndUpdatePost(commentId, locals.user);
		return { commentIdRaw };
	})
};
```

- [ ] **Step 2: 타입 검사 + lint**

```bash
npm run check && npm run lint
```

Expected: 에러 없음, 포맷 경고 없음

- [ ] **Step 3: 커밋**

```bash
git add src/routes/board/[boardId=board]/[postId]/+page.server.ts
git commit -m "feat: server-side guard for comments/likes via BOARD_CONFIG"
```

---

### Task 8: 최종 검증

- [ ] **Step 1: 전체 타입 검사 + lint**

```bash
npm run check && npm run lint
```

Expected: 에러 없음

- [ ] **Step 2: 브라우저 스모크 (dev 서버가 떠 있어야 함)**

```bash
for b in notice free bylaw; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/board/$b")
  echo "/board/$b -> $code"
done
```

Expected: 셋 다 200

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git status
git commit -m "chore: board-config refactor complete — notice/bylaw comments off"
```
