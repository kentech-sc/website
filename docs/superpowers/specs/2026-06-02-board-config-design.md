# Board Config — 게시판별 기능 설정 설계

**날짜:** 2026-06-02
**범위:** Feature 1 — 댓글·좋아요·작성권한 중앙 설정화, 회칙·공지 댓글 비활성화

---

## 배경

`[boardId=board]` 제네릭 라우트가 notice/free/bylaw를 공통 처리하는 구조에서, 게시판별 정책(작성 권한, 댓글 여부 등)이 여러 파일에 흩어진 하드코딩으로 관리되고 있었다.

- `post.rule.ts`에 `boardId === Notice || boardId === Bylaw` 분기
- `BoardHeader.svelte`에 `boardId === 'bylaw'` 분기
- `hooks.server.ts`에 `free|notice` 정규식 (bylaw 누락 버그 발생)

이 버그를 수정하면서, 분산된 boardId 조건을 **단일 진실 공급원(single source of truth)** 으로 통합한다.

---

## 정책 테이블

| 게시판   | `label`    | `description`                       | 댓글   | 좋아요 | 작성 권한  |
| -------- | ---------- | ----------------------------------- | ------ | ------ | ---------- |
| `notice` | 공지사항   | 총학생회 공지를 확인하세요          | ❌ off | ✅ on  | moderator+ |
| `free`   | 자유게시판 | 자유롭게 글을 남겨보세요            | ✅ on  | ✅ on  | user+      |
| `bylaw`  | 회칙·세칙  | 총학생회의 회칙과 세칙을 확인하세요 | ❌ off | ✅ on  | moderator+ |

---

## 아키텍처

### 변경 전

```
post.rule.ts       ← if (Notice || Bylaw) moderator 하드코딩
BoardHeader.svelte ← if (bylaw) 제목/설명 하드코딩
hooks.server.ts    ← 정규식 free|notice (bylaw 빠짐)
```

### 변경 후

```
lib/types/board.type.ts  ← BOARD_CONFIG 정의 (정책 데이터)
        │
        ├── post.rule.ts             ← config.writeMinRole 참조 (결정 로직은 rule에)
        ├── BoardHeader.svelte       ← config.label / config.description 참조
        ├── BoardArticle.svelte      ← config.allowLikes 로 LikeBtn 조건 렌더
        ├── BoardList.svelte         ← config.allowLikes 로 좋아요 컬럼 조건 렌더
        ├── [postId]/+page.svelte    ← config.allowComments 로 CommentSection 조건 렌더
        └── [postId]/+page.server.ts ← 서버 액션 가드 (likePost, createComment 등)
```

**레이어 규칙 준수:**

- `BOARD_CONFIG`는 _데이터_(임계값, 플래그)만 담고 결정 로직 없음
- 권한 판단(`hasMinRole`)은 여전히 `rules/` 레이어에 위치
- `config.allowComments === false`일 때 서버 액션이 직접 `fail(403)`을 반환 (CSS hidden 대신)

---

## 컴포넌트·파일별 변경 내역

### 1. `lib/types/board.type.ts`

`BOARD_CONFIG` 상수 추가. `BoardHeader`에 흩어진 label/description도 여기로 통합.

```ts
interface BoardConfig {
	label: string;
	description: string;
	allowComments: boolean;
	allowLikes: boolean;
	writeMinRole: UserGroup;
}

export const BOARD_CONFIG = {
	[BoardId.Notice]: {
		label: '공지사항',
		description: '총학생회 공지를 확인하세요',
		allowComments: false,
		allowLikes: true,
		writeMinRole: UserGroup.Moderator
	},
	[BoardId.Free]: {
		label: '자유게시판',
		description: '자유롭게 글을 남겨보세요',
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
} as const satisfies Record<BoardId, BoardConfig>;
```

### 2. `lib/rules/post.rule.ts`

`canCreatePost`의 하드코딩 분기 → config 참조로 교체.

```ts
export function canCreatePost(post: PostCreate, user: User): boolean {
	return hasMinRole(user, BOARD_CONFIG[post.boardId].writeMinRole);
}
```

### 3. `BoardHeader.svelte`

label/description 하드코딩 분기(if/else if 체인) → config 참조로 교체.

### 4. `BoardArticle.svelte`

`BOARD_CONFIG[boardId].allowLikes === false`일 때 `LikeBtn` 및 헤더 내 좋아요 카운트 숨김.

### 5. `BoardList.svelte`

`allowLikes === false`일 때 좋아요 컬럼(th/td/colgroup/모바일 meta 텍스트) 숨김.

### 6. `[postId]/+page.svelte`

`allowComments === false`일 때 `CommentSection` 미렌더.

### 7. `[postId]/+page.server.ts`

`likePost`, `unlikePost`, `createComment`, `deleteComment` 액션 진입부에 서버 가드 추가.
`allowLikes === false`면 likePost/unlikePost → `fail(403)`.
`allowComments === false`면 createComment/deleteComment → `fail(403)`.

---

## 스코프 밖 (이번 PR에서 제외)

- 개정일/시행일 메타데이터 필드
- 분류(카테고리) 기능 — 다음 단계
- PDF 인라인 뷰어 — 다음 단계
- 게시글/댓글 로그 (#22)
