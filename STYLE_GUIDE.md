# KENTECH-SC 스타일 가이드

## 1. 목적

- 이 문서는 스타일 구조, 단위, 명명 규칙, 공용 스타일 사용 기준을 정한다.
- 스타일은 전역 foundation과 컴포넌트 로컬 스타일로 나눈다.

## 2. 파일 역할

- `src/style/color.scss`
  - 색상 관련 CSS 변수만 둔다.
  - `:root`와 테마 전환용 변수만 정의한다.
  - 실제 selector 스타일은 넣지 않는다.

- `src/style/base.scss`
  - reset과 기본 element 스타일만 둔다.
  - app 전용 class나 레이아웃 패턴은 넣지 않는다.
  - 보수적으로 기본값만 정리한다.

- `src/style/components.scss`
  - 정말 많이 반복되는 공용 패턴만 둔다.
  - 예: `container`, `container-col`, `module`, `btn-action`, `error`
  - 페이지 전용 스타일은 넣지 않는다.

- `src/style/main.scss`
  - 전역 스타일 진입점으로 둔다.
  - `color`, `base`, `components`, `font` 등을 모아 import한다.

- `src/style/nmu.scss`
  - Nemo Markup 렌더링용 스타일로 둔다.
  - 게시글, 청원, 에디터 본문 같은 rich text 출력에 사용한다.

- 각 `.svelte` 파일의 `<style lang="scss">`
  - 해당 컴포넌트에서만 쓰는 레이아웃과 세부 스타일을 둔다.

## 3. 전역 / 로컬 기준

- 전역에는 아래만 둔다.
  - color token
  - reset
  - 기본 element 스타일
  - 공용 utility
  - 공용 패턴

- 아래는 각 컴포넌트 로컬 스타일에 둔다.
  - 페이지별 레이아웃
  - 섹션 전용 간격
  - 특정 화면에서만 쓰는 버튼/배치
  - 기능 전용 세부 selector

## 4. 색상 규칙

- 색상은 직접 hex, rgb, named color를 쓰지 않는다.
- `var(--...)`만 사용한다.
- 색상은 반드시 `color.scss`에 모은다.
- 새 색상이 필요하면 먼저 `color.scss`에 변수를 추가한다.

## 5. 단위 규칙

- 기본 단위는 `rem`을 사용한다.
- 상대 크기가 필요한 경우에만 `%`를 사용한다.
- viewport 기준 레이아웃에만 `vw`, `vh`를 사용한다.
- 일반 UI 치수에 `vw`, `vh`를 사용하지 않는다.

### 예

- `padding`, `margin`, `gap`, `font-size`, `border-radius`, 고정 폭/높이 -> `rem`
- 내부 비율, 가득 채우기 -> `%`
- hero, slideshow, viewport 레이아웃 -> `vw`, `vh`

## 6. 수치 스케일

- spacing, gap, padding, margin, radius, fixed size는 `0.2rem` 배수를 사용한다.
- 예:
  - `0.2rem`
  - `0.4rem`
  - `0.6rem`
  - `0.8rem`
  - `1rem`
  - `1.2rem`
  - `1.6rem`
  - `2rem`

- border, outline, separator 같은 시각 보정값은 `0.1rem` 예외를 허용한다.

## 7. base.scss 규칙

- `base.scss`는 reset과 기본 element 스타일만 둔다.
- `margin`은 필요한 element에 넓게 reset한다.
- `padding`은 필요한 element만 reset한다.
- `* { margin: 0; padding: 0; }` 같은 과한 전역 reset은 피한다.

### 권장 예

- `box-sizing: border-box`
- `html`, `body`, heading, `p`, list 계열의 `margin: 0`
- `ul`, `ol`의 `padding: 0`과 `list-style: none`
- `button`, `input`, `textarea`, `select`의 `font: inherit`

## 8. components.scss 규칙

- 아래 조건을 만족할 때만 공용 패턴으로 올린다.
  - 3곳 이상 반복된다.
  - 모양과 역할이 거의 같다.
  - 페이지 전용이 아니다.

- 예:
  - `.container`
  - `.container-col`
  - `.module`
  - `.btn-anchor`
  - `.btn-action`
  - `.error`, `.warn`, `.success`, `.info`

- 아래는 넣지 않는다.
  - board 전용 header
  - petition 전용 response 영역
  - review 전용 카드 세부 스타일

## 9. 클래스 명명 규칙

- 클래스는 `kebab-case`를 사용한다.
- 이름은 모양이 아니라 역할 기준으로 짓는다.

### 좋은 예

- `board-article`
- `article-header`
- `article-meta`
- `comment-list`
- `comment-item`
- `response-form`
- `action-row`

### 나쁜 예

- `box1`
- `left-area`
- `blue-button`
- `div2`

## 10. 상태 명명 규칙

- 상태 class는 `is-`, `has-`, `can-` 접두사를 사용한다.

### 예

- `is-active`
- `is-open`
- `is-disabled`
- `has-error`

- Svelte에서는 가능하면 `class:is-active={...}` 형태를 우선한다.

## 11. id 사용 규칙

- 스타일링 용도로 `id`를 사용하지 않는다.
- CSS selector는 기본적으로 class를 사용한다.
- `id`는 아래 경우에만 사용한다.
  - `label for=...`
  - fragment anchor
  - `aria-labelledby`, `aria-controls`
  - 외부 라이브러리가 유일 id를 요구하는 경우

- JS 훅이나 테스트 타깃은 가능하면 `data-*`를 사용한다.

## 12. 전역 클래스와 로컬 클래스

- 전역 클래스는 짧고 범용적인 패턴만 둔다.
- 로컬 클래스는 해당 컴포넌트 역할에 맞게 둔다.

### 전역 예

- `container`
- `container-col`
- `module`
- `btn-action`

### 로컬 예

- `article-header`
- `sign-button`
- `response-actions`

## 13. 최종 원칙

1. 색상은 `color.scss` 변수만 사용한다.
2. 기본 단위는 `rem`을 사용한다.
3. 상대 크기는 `%`를 사용한다.
4. viewport 레이아웃에만 `vw`, `vh`를 사용한다.
5. spacing scale은 `0.2rem` 배수를 사용한다.
6. border 등 시각 보정은 `0.1rem` 예외를 허용한다.
7. `base.scss`는 reset과 element 기본값만 둔다.
8. `components.scss`는 반복되는 공용 패턴만 둔다.
9. 세부 스타일은 각 `.svelte` 파일 로컬 스타일에 둔다.
10. 클래스는 `kebab-case`와 역할 중심 이름을 사용한다.
11. `id`는 스타일용으로 쓰지 않는다.
