# KENTECH Student Council Website

KENTECH 학생회 웹사이트 저장소입니다. 내부 개발자 기준으로 로컬 실행, 구조 파악, 운영 포인트를 빠르게 확인할 수 있도록 정리한 README입니다.

## 프로젝트 개요

이 프로젝트는 SvelteKit 기반의 학생회 웹 애플리케이션입니다. 현재 코드 기준으로 아래 기능을 제공합니다.

- 게시판
  - `/board/free`
  - `/board/notice`
  - `/board/bylaw`
- 청원
  - `/petition`
  - `/petition/[petitionId]`
- 강의평가
  - `/review`
  - `/review/[reviewId]`
- 강의/교수 관리
  - `/course/new`
- 검색
  - `/search`
- 프로필 및 운영 관리
  - `/profile`
- 로그인
  - `/signin`

홈 화면(`/`)에서는 공지, 청원, 자유게시판, 강의평가 목록 일부를 모아 보여줍니다.

## 기술 스택

- 프레임워크: SvelteKit 2, Svelte 5, Vite 7
- 언어: TypeScript
- 스타일: SCSS, Prettier
- 데이터베이스: MongoDB, Mongoose
- 인증: Auth.js for SvelteKit, Google OAuth
- 파일 저장: `secure-s3-storage` 기반 AWS S3 업로드
- 에러 추적: Sentry for SvelteKit
- 배포 타깃: Vercel 어댑터

## 로컬 실행

### 선행 조건

- Node.js 20 이상 권장
- MongoDB 접근 가능 환경
- Google OAuth 클라이언트
- AWS S3 버킷 및 접근 키

### 실행 순서

1. 의존성 설치

```powershell
npm.cmd install
```

2. 루트 `.env` 파일 구성

필수 환경 변수는 아래 `환경 변수` 섹션을 기준으로 채웁니다.

3. 개발 서버 실행

```powershell
npm.cmd run dev
```

4. 타입 및 Svelte 검사

```powershell
npm.cmd run check
```

## 환경 변수

아래 키들은 현재 코드에서 사용하거나 빌드/배포 시 필요한 항목입니다.

| 이름                | 용도                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| `MONGO_URI`         | MongoDB 연결 문자열. 서버 시작 시 `mongoose.connect()`에 사용됩니다. |
| `GOOGLE_ID`         | Google OAuth 클라이언트 ID입니다.                                    |
| `GOOGLE_SECRET`     | Google OAuth 클라이언트 시크릿입니다.                                |
| `AUTH_SECRET`       | Auth.js 세션/토큰 서명에 사용하는 비밀값입니다.                      |
| `SENTRY_AUTH_TOKEN` | Sentry 소스맵 업로드에 사용하는 토큰입니다.                          |
| `AWS_BUCKET_NAME`   | 업로드 대상 S3 버킷 이름입니다.                                      |
| `AWS_BUCKET_REGION` | S3 버킷 리전입니다.                                                  |
| `AWS_ID`            | S3 접근용 AWS access key ID입니다.                                   |
| `AWS_SECRET`        | S3 접근용 AWS secret access key입니다.                               |
| `MAX_FILE_SIZE`     | 업로드 가능한 최대 파일 크기 바이트 값입니다.                        |

## 주요 스크립트

| 스크립트                | 설명                                              |
| ----------------------- | ------------------------------------------------- |
| `npm.cmd run dev`       | Vite 개발 서버를 실행합니다.                      |
| `npm.cmd run build`     | 프로덕션 빌드를 생성합니다.                       |
| `npm.cmd run preview`   | 빌드 결과를 로컬에서 미리 확인합니다.             |
| `npm.cmd run check`     | `svelte-kit sync` 후 `svelte-check`를 실행합니다. |
| `npm.cmd run fix`       | Prettier와 ESLint 자동 수정을 한 번에 실행합니다. |
| `npm.cmd run all-check` | `fix` 후 `check`까지 연속 실행합니다.             |

## 프로젝트 구조

```text
src/
├─ routes/          SvelteKit 라우트와 페이지 엔트리
├─ components/      여러 라우트에서 재사용하는 UI 컴포넌트
├─ lib/
│  ├─ types/        공용 타입 정의
│  ├─ shared/       client/server 공용 유틸과 공통 규칙 표현
│  ├─ server/       서버 전용 초기화, 에러 처리, 스토리지, 에디터 유틸
│  ├─ repositories/ DB CRUD와 query 계층
│  ├─ rules/        도메인 규칙 함수
│  ├─ services/     단일 도메인 단위 작업 조합
│  └─ usecase/      여러 서비스 조합, 최종 화면 데이터 구성, 트랜잭션 경계
└─ style/           전역 스타일, 토큰, shared SCSS
```

레이어별 책임 상세 규칙은 [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)를 기준으로 봅니다.

## 권한 및 접근 흐름

### 사용자 그룹

- `guest`
  - 비로그인 사용자입니다.
- `user`
  - 자유게시판 작성, 댓글 작성, 게시글 좋아요, 청원 작성/서명, 강의평가 작성이 가능합니다.
- `moderator`
  - 게시글/댓글 관리와 공지/회칙 게시판 작성 권한이 추가됩니다.
- `manager`
  - 강의평가 관리, 청원 관리/응답, 강의/교수 관리, 사용자 관리 권한이 추가됩니다.
- `dev`
  - 개발 운영용 권한 그룹으로, 게시판/댓글 관리와 강의/교수/사용자 관리, orphan 파일 정리 권한을 가집니다.

### 로그인 필요 경로

코드 기준으로 아래 경로는 비로그인 사용자가 접근하면 `/signin`으로 리다이렉트됩니다.

- `/petition`
- `/course`
- `/review`
- `/profile`
- `/board/free/new`, `/board/notice/new`, `/board/bylaw/new`
- `/board/free/[postId]/edit`, `/board/notice/[postId]/edit`, `/board/bylaw/[postId]/edit`

목록/상세 조회는 일부 게스트 접근이 가능하지만, 작성·수정·운영 액션은 서버 권한 체크를 통과해야 합니다.

## 콘텐츠 및 파일 처리

- 게시글과 청원 작성 폼은 공용 에디터를 사용합니다.
- 에디터 업로드는 서버 액션을 통해 S3에 저장됩니다.
- 업로드된 파일은 `file meta`로 관리되며, 본문 이미지와 첨부 파일이 최종 저장 전에 정규화됩니다.
- 본문 이미지에는 `data-file-id`가 연결되고, 저장 시 실제 접근 가능한 경로로 치환됩니다.
- 이미지 외 첨부 파일과 본문 이미지 사용 파일을 합쳐 article과 연결합니다.
- 업로드 가능 최대 크기는 `MAX_FILE_SIZE`로 제한됩니다.
- 현재 스토리지 카테고리는 이미지와 문서 파일 업로드를 기준으로 구성되어 있습니다.

## 배포 및 관측

- SvelteKit 어댑터는 `@sveltejs/adapter-vercel`을 사용합니다.
- Vite 설정에 Sentry 플러그인이 연결되어 있어 배포 시 소스맵 업로드 구성을 사용할 수 있습니다.
- 서버 시작 시 `src/hooks.server.ts`의 `init`에서 아래 초기화가 실행됩니다.
  - MongoDB 연결 초기화
  - S3 스토리지 초기화
- 런타임 에러는 Sentry 핸들러를 통해 수집되도록 구성되어 있습니다.

## 참고 문서

- [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)
  - 레이어 책임, import 방향, repository/service/usecase 경계를 확인할 때 봅니다.
- [STYLE_GUIDE.md](./STYLE_GUIDE.md)
  - SCSS 배치, rem 단위 규칙, selector 정책, shared style 기준을 확인할 때 봅니다.
