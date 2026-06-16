# KENTECH-SC 구조 규칙

## 1. 레이어 역할

- `src/lib/types`
  - standalone `type`, `interface`, type alias를 둔다.
  - 타입 소유권이 애매하면 `general.type.ts`에 둔다.
  - `src/app.d.ts`만 SvelteKit 전역 타입 예외로 둔다.
- `src/lib/shared`
  - client/server 공용 순수 코드를 둔다.
  - 예: `permission.ts`, `rule.ts`, `utils.ts`, `view.ts`, `paginate.ts`, `flash.ts`
- `src/lib/server`
  - 서버 전용 인프라를 둔다.
  - 예: `errors.ts`, `db.ts`, `storage.ts`, `flash.ts`
- `src/lib/models`
  - Mongoose schema/model만 둔다.
- `src/lib/repositories`
  - DB CRUD / query만 둔다.
- `src/lib/rules`
  - 도메인 규칙 함수만 둔다.
- `src/lib/services`
  - `repository + rules`로 처리하는 단일 도메인 작업을 둔다.
- `src/lib/usecase`
  - 여러 service 조합, transaction, 최종 흐름 구성을 둔다.

## 2. 의존 방향

- client -> shared, types
- server entry -> usecase, shared, types, server
- usecase -> service, shared, types
- service -> rules, repositories, shared, types, server
- repositories -> models, shared, types
- models -> types
- rules -> shared, types

## 3. import 규칙

1. client

- `shared`, `types`만 import한다.
- `usecase`, `service`, `rules`, `repositories`, `server`는 import하지 않는다.

2. server entry

- `usecase`, `shared`, `types`, `server`만 import한다.
- `service`, `rules`, `repositories`는 import하지 않는다.
- server entry 예시:
  - `+page.server.ts`
  - `+layout.server.ts`
  - `+server.ts`
  - `actions`
  - `hooks.server.ts`

3. usecase

- `service`, `shared`, `types`만 import한다.
- `repositories`를 직접 import하지 않는다.

4. service

- `rules`, `repositories`, `shared`, `types`를 import한다.
- 서버 전용 인프라가 필요할 때만 `server`를 import한다.

5. repositories

- `models`, `shared`, `types`만 import한다.
- 다른 layer를 import하지 않는다.

6. models

- `types`만 import한다.
- model 전용 Mongoose schema/document 타입은 대응 type 파일에서 가져온다.

7. rules

- throw하지 않는다.
- 아래 둘 중 하나만 반환한다.
  - `boolean`
  - `RuleResult = { ok: true } | { ok: false; type; message }`

## 4. 코드 / 명명 규칙

- class가 아니면 `this` 사용을 자제한다.
- `.svelte` 파일 안의 로컬 함수나 callback은 arrow function을 우선한다.
- 일반적인 module 파일의 top-level 함수는 `function` 선언을 사용한다.
- class 메서드, module 객체 메서드, callback처럼 구조상 필요한 경우만 예외로 arrow function을 사용한다.
- 상수 이름은 `SCREAMING_SNAKE_CASE`를 사용한다.

### 타입 위치

- standalone `type`, `interface`, type alias는 `src/lib/types`에만 둔다.
- 특정 도메인에 속하는 타입은 해당 도메인 type 파일에 둔다.
- 공용인데 소유권이 애매하면 `general.type.ts`에 둔다.
- model은 대응 `...Entity` 타입을 generic으로 사용한다.

### collection 이름

- array나 set 이름은 자료구조를 드러내기보다 그냥 복수형을 사용한다.
- 예: `ids`, `names`, `users`
- 같은 의미의 array와 set이 함께 있으면 접미사로 구분한다.
- 예: `idArr`, `idSet`

### map 이름

- map 이름은 `[key]To[value]` 형태를 사용한다.
- 예: `nameToUser`, `userIdToProfile`

### 함수 이름

- collection을 반환하거나 다루는 함수명도 그냥 복수형을 사용한다.
- 예: `getUserIds`, `findUsers`
- `List`, `Array`, `Set` 같은 자료구조 이름을 함수명에 붙이지 않는다.

### Date 값

- `Date` 값은 앱 전역에서 기본적으로 ISO string으로 다룬다.
- `types`, `shared`, `repositories`, `services`, `usecase`, `server entry` 경계 밖으로 raw `Date` 인스턴스를 내보내지 않는다.
- 예: `createdAt`, `updatedAt`, `deletedAt`, `answeredAt` 같은 값은 타입과 반환값에서 ISO string으로 둔다.
- 실제 `Date` 객체는 DB query, 비교, 계산처럼 필요한 내부 구현에서만 잠깐 사용하고, 반환 직전에 다시 ISO string으로 변환한다.
- 단, Mongoose schema / query 내부 구현에서는 raw `Date`를 잠깐 사용할 수 있다.

### ObjectId 값

- `ObjectId` 값은 앱 전역에서 기본적으로 string으로 다룬다.
- POJO를 유지해야 하므로 `types`, `shared`, `repositories`, `services`, `usecase`, `server entry` 경계 밖으로 raw `ObjectId` 인스턴스를 내보내지 않는다.
- 예: `_id`, `userId`, `postId`, `petitionId`, `courseId`, `professorId`, `fileId` 같은 값은 타입과 반환값에서 string으로 둔다.
- 실제 `ObjectId` 객체는 DB query, populate, 비교처럼 필요한 내부 구현에서만 잠깐 사용하고, 반환 직전에는 다시 string으로 변환한다.
- 단, Mongoose schema / query 내부 구현에서는 raw `ObjectId`를 잠깐 사용할 수 있다.

## 5. repository 메서드 규칙

- repository는 DB CRUD / query만 다루고, 각 메서드의 반환 계약을 명확히 유지한다.
- stateful mutation에서는 비즈니스 판단을 넣지 않고, 동시성 때문에 필요한 atomic precondition만 query 조건으로 둔다.
- retry, fallback, reset 같은 오케스트레이션은 service에서 처리한다.

### create

- `create...`는 생성된 결과를 반환한다.

### read

- `null` 또는 `[]`가 결과로 나올 수 있으면 `find` 키워드를 사용한다.
- `find...`는 `null` 또는 `[]`를 그대로 반환한다.
- `null` 또는 `[]`가 절대 나오지 않으면 `get` 키워드를 사용한다.
- `get...`은 반드시 결과가 있다고 가정하는 조회에만 사용한다.

### update

- `update...`는 `updatedDoc` 또는 `null`을 반환한다.

### delete

- `delete...`는 성공/실패 여부인 `boolean`을 반환한다.

## 6. transaction / error

- transaction owner는 항상 usecase로 둔다.
- service는 transaction을 직접 열지 않는다.
- 에러는 `AppError` 하나로 통일한다.
- `APP_ERROR` 상수 객체에 `code + status`를 함께 둔다.
- service는 `assertRule(...)` 또는 repository 결과를 보고 `AppError`를 throw한다.
- service가 pre-read와 `assertRule(...)`를 끝낸 뒤 guarded mutation이 실패하면, 기본적으로 stale-state로 보고 `INVALID_STATE`를 던진다.
- usecase는 보통 `AppError`를 전파한다.
- server entry는 `AppError`를 HTTP 응답으로 바꾼다.

## 7. 권한 모델

- `UserGroup`은 `guest`, `user`, `moderator`, `manager`, `dev`를 둔다.
- 권한 모델은 `RBAC + capability + resource rule`로 둔다.
- RBAC:
  - 사용자에게 역할을 부여한다.
- capability:
  - 역할마다 실제 행동 단위 권한을 부여한다.
- resource rule:
  - capability, owner 예외, 상태 조건을 조합해서 최종 권한을 판단한다.

### 예시 capability

- `board.free.write`
- `board.notice.write`
- `board.bylaw.write`
- `post.like`
- `post.moderate`
- `comment.write`
- `comment.moderate`
- `review.write`
- `review.moderate`
- `petition.write`
- `petition.sign`
- `petition.manage`
- `petition.respond`
- `petition.delete.any`
- `course.manage`
- `professor.manage`
- `user.manage`
- `system.cleanup`

## 8. 권한 처리 규칙

- 실제 권한 체크는 `service + rules`에서 한다.
- UI 표시 여부는 server entry / usecase가 계산한 `permissions` boolean을 내려준다.
- client는 `permissions.canXxx`만 사용한다.
- client가 `rules`를 직접 import해서 권한을 판단하지 않는다.

## 9. 프론트 상태 규칙

- 읽기 전용 서버 데이터는 `const $derived`를 둔다.
- 상위 데이터 기반 + 임시 로컬 변경은 `let $derived`를 둔다.
- 진짜 로컬 draft / UI 상태는 `$state`를 둔다.
- 부수효과는 `$effect`로 처리한다.
- 큰 폼이나 에디터 리셋은 `#key`로 처리한다.

## 10. 현재 UI 데이터 처리 방침

- 좋아요 / 서명 / 답변은 optimistic patch보다 `invalidateAll()` 또는 재조회 방식을 우선한다.
- action 성공 후 서버 데이터를 다시 불러온다.
- 화면은 서버 데이터를 다시 그린다.

## 11. 에러 UX 규칙

- load 에러는 `+error.svelte`에서 처리한다.
- action 에러는 현재 화면의 폼에 남긴다.
- `CommonForm.svelte`는 action 결과를 공통 정책으로 먼저 처리한다.
- status가 필요하지 않은 폼은 message만 표시한다.

### status 기본 정책

- `400`
  - 입력 오류로 본다.
  - 현재 화면에서 message만 표시한다.
- `403`
  - 권한 오류로 본다.
  - 현재 화면에서 message만 표시한다.
- `404`
  - 대상이 삭제되었거나 사라진 상태로 본다.
  - flash를 남기고 목록 또는 상위 화면으로 이동한다.
- `409`
  - 상태 충돌 또는 stale state로 본다.
  - 현재 화면을 `invalidateAll()`로 재조회한다.
- `500+`
  - 일반 서버 오류로 본다.
  - 현재 화면에서 일반 오류 message를 표시한다.

## 12. flash 메시지 규칙

- flash 메시지는 전역 UX 계층으로 처리한다.
- 루트 레이아웃이 flash를 렌더링한다.
- flash 타입은 `kind + message`를 사용한다.

### server 이동

- server redirect가 필요한 경우 `server/flash.ts`를 사용한다.
- cookie에 flash를 저장하고 다음 요청에서 1회 읽고 지운다.

### client 이동

- client `goto(...)`가 필요한 경우 `shared/flash.ts`를 사용한다.
- `sessionStorage`에 flash를 저장하고 다음 화면에서 1회 읽고 지운다.
- flash 메시지는 client에서 새로 하드코딩하지 않는다.
- action / load가 내려준 에러 메시지를 우선 사용한다.
- status는 이동, 재조회, 현재 화면 유지 여부를 판단하는 용도로만 사용한다.
- `CommonForm`은 `policy` preset으로 공통 상태 정책을 처리한다.
- 공통 message 추출은 `shared/action-result.ts`에서 처리한다.
- `policy="reload"`는 성공, `404`, `409`에서 `invalidateAll()`을 수행한다.
- `policy={{ kind: 'detail', notFoundRedirectTo }}`는 성공/`409`에서 `invalidateAll()`, `404`에서 flash 후 이동을 수행한다.
- 각 화면은 `404` 이동 URL, 성공 후 추가 동작, 편집 종료 같은 화면별 차이만 `afterSuccess`, `afterConflict`로 지정한다.

### 현재 적용 기준

- `404`에서 목록 이동이 필요한 board / petition 상세 action은 client flash를 남기고 이동한다.
- `409`는 현재 화면을 재조회한다.
- `400`, `403`은 각 폼에서 message를 유지한다.

## 13. 최종 요약

1. client는 `shared`, `types`만 본다.
2. server entry는 `usecase`, `shared`, `types`, `server`만 본다.
3. 일반 코드에서는 `this`를 자제하고, `.svelte` 로컬 함수는 arrow, module top-level 함수는 `function` 선언을 사용한다.
4. collection은 복수형, map은 `[key]To[value]`, 상수는 `SCREAMING_SNAKE_CASE`, 날짜 값은 ISO string, `ObjectId` 값은 string을 사용한다.
5. repository 메서드는 `create/find/get/update/delete` 반환 계약을 유지한다.
6. usecase는 service를 조합하고 transaction을 연다.
7. service는 단일 도메인 작업과 `AppError`를 책임진다.
8. rules는 결과만 반환한다.
9. repositories는 DB만 다룬다.
10. 권한은 `RBAC + capability + resource rule`로 처리한다.
11. 에러 UX는 `AppError -> server entry -> form/page -> flash` 흐름으로 처리한다.
