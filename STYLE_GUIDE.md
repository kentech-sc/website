# KENTECH-SC Style Guide

## 1. 목적

- 이 문서는 스타일 구조, 책임 범위, 네이밍, 공용화 기준을 정리한다.
- 스타일은 foundation, shared component pattern, local component style로 나눈다.

## 2. 파일 역할

- `src/style/color.scss`
  - 색상 토큰만 둔다.
  - 실제 selector 스타일은 두지 않는다.

- `src/style/base.scss`
  - reset과 기본 element 스타일만 둔다.
  - 앱 전용 layout이나 page-specific class는 두지 않는다.

- `src/style/components.scss`
  - 3곳 이상 거의 같은 구조로 반복되는 shared pattern만 둔다.
  - page-specific selector는 넣지 않는다.

- `src/style/legal-page.scss`
  - `terms`, `privacy`처럼 문서형 페이지 2곳이 공유하는 mixin만 둔다.
  - app-wide utility처럼 확장하지 않는다.

- `src/style/nmu.scss`
  - rich text renderer 전용 스타일만 둔다.
  - generated markup과 renderer 제약 때문에 필요한 selector 예외를 허용한다.

- 각 `.svelte` 파일의 `<style lang="scss">`
  - 해당 컴포넌트에서만 쓰는 local layout과 domain-specific style만 둔다.

## 3. 기본 단위

- 루트 기준은 `html { font-size: 20px; }`다.
- 반응형에서는 root font-size를 줄일 수 있다.
- UI 값은 기본 20px 기준의 `rem` 스케일로 작성한다.
- 상대 크기 비율은 `%`를 사용한다.
- viewport 기반 레이아웃에서만 `vw`, `vh`를 사용한다.

## 4. 스케일 규칙

- spacing 계열은 `0.2rem` 단위로 맞춘다.
  - `margin`
  - `padding`
  - `gap`
  - `row-gap`
  - `column-gap`
  - `inset`
  - `top`, `right`, `bottom`, `left`

- 크기 계열은 `0.1rem` 단위로 맞춘다.
  - `font-size`
  - `border-radius`
  - icon `size`

- border, outline, separator 같은 시각 보정값은 `0.1rem` 예외를 허용한다.
- `line-height`는 grid에 억지로 맞추지 말고 unitless를 우선한다.

## 5. 공용화 기준

- 아래 조건을 만족하면 `components.scss`나 page-specific partial로 올린다.
  - 3곳 이상 반복된다.
  - 구조와 역할이 거의 같다.
  - 특정 페이지 도메인에 묶여 있지 않다.

- 단순히 값이 비슷하다는 이유만으로 합치지 않는다.
- 공용화 후 local style은 도메인 차이만 남긴다.

## 6. Selector 규칙

- 스타일링 목적의 `id` selector는 사용하지 않는다.
- CSS selector는 기본적으로 class를 사용한다.
- `id`는 아래 경우에만 둔다.
  - `label for`
  - fragment anchor
  - `aria-labelledby`, `aria-controls`
  - 외부 라이브러리나 generated markup이 강제하는 경우

- broad descendant selector는 피한다.
  - 피할 것: `div {}`, `header div {}`, `& > div {}`
  - 권장: 의미 있는 local class를 붙여서 직접 지정

## 7. 네이밍 규칙

- class는 `kebab-case`를 사용한다.
- 상태 class는 `is-`, `has-`, `can-` 접두어를 사용한다.
- 이름은 모양이 아니라 역할 기준으로 짓는다.

## 8. 전역 / 로컬 기준

- 전역에는 아래만 둔다.
  - color token
  - reset
  - base element style
  - shared pattern

- 아래는 local style에 둔다.
  - page 전용 layout
  - domain-specific header/list/article style
  - 특정 화면에서만 쓰는 예외 처리

## 9. 체크리스트

1. 색상은 `var(--...)`만 사용한다.
2. 기본 단위는 `rem`으로 쓴다.
3. spacing 값은 `0.2rem` 스케일을 따른다.
4. font-size, radius, icon size는 `0.1rem` 스케일을 따른다.
5. style-only `id` selector를 만들지 않는다.
6. broad selector 대신 명시적인 local class를 사용한다.
7. 3곳 이상 반복되는 패턴은 shared SCSS로 올린다.
8. `nmu.scss` 예외는 rich text renderer 범위 안에서만 허용한다.
