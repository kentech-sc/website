# KENTECH-SC Style Guide

## 1. 목적

- 이 문서는 스타일 구조, 책임 범위, 네이밍, 공용화 기준을 정리한다.
- 스타일은 foundation, shared component pattern, local component style로 나눈다.

## 2. 파일 역할

- `src/style/color.scss`
  - 색상 토큰만 둔다.
  - 실제 selector 스타일은 두지 않는다.

- `src/style/base.scss`
  - reset, 기본 element 스타일, 테두리 두께 등 전역 기본값을 둔다.
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
- viewport 기반 레이아웃에서만 viewport 단위를 사용한다. 현재 페이지 최소 높이는 `100svh`, 시간표 검색 패널의 최대 높이는 `dvh`를 사용한다.
- `svh`는 작은 viewport 기준의 안정적인 높이, `dvh`는 브라우저 UI 변화에 따라 달라지는 높이가 필요할 때 선택한다. `vh`를 기계적으로 치환하지 않는다.

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
- 본문 `line-height`는 unitless를 우선한다. 공통 액션 버튼은 일정한 줄 높이를 위해 `1.2rem`을 사용한다.
- CSS의 border 값이 같아도 배치 좌표·높이·화면 배율에 따른 렌더링 차이는 생길 수 있다. 이를 숨기기 위한 개별 위치 보정은 추가하지 않는다.

## 5. 공용화 기준

- 아래 조건을 만족하면 공통 UI 컴포넌트로 올린다. 마크업이 없는 공통 시각 규칙만 shared SCSS로 둔다.
  - 3곳 이상 반복된다.
  - 구조와 역할이 거의 같다.
  - 특정 페이지 도메인에 묶여 있지 않다.

- 단순히 값이 비슷하다는 이유만으로 합치지 않는다.
- 공용화 후 local style은 도메인 차이만 남긴다.

## 6. Selector 규칙

- 스타일링 목적의 `id` selector는 사용하지 않는다.
- 공통 패턴의 범위는 class로 정하고, 그 안에서는 의미 있는 태그와 직접 자식 선택자를 우선한다.
- `id`는 아래 경우에만 둔다.
  - `label for`
  - fragment anchor
  - `aria-labelledby`, `aria-controls`
  - 외부 라이브러리나 generated markup이 강제하는 경우

- 전역의 광범위한 후손 선택자는 피한다. 컴포넌트 내부에서는 `header`, `header > button`처럼 범위가 명확한 태그 선택자를 사용해도 된다. 다른 컴포넌트 내부까지 스타일을 침투시키지 않는다.

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
6. 컴포넌트 내부에서는 태그와 직접 자식 선택자를 우선하고, 구분이 필요한 곳에만 class를 붙인다.
7. 반복되는 구조·동작·스타일은 공통 UI가 함께 소유한다.
8. `nmu.scss` 예외는 rich text renderer 범위 안에서만 허용한다.

## 10. 디자인 소유권

- 컴포넌트 한 곳의 디자인은 그 컴포넌트의 `<style>`에서 찾을 수 있게 둔다.
- 스타일이 길어지면 먼저 독립된 UI 책임을 분리한다. 줄 수만 줄이는 mixin 추출은 하지 않는다.
- 한 기능만 사용하는 대형 스타일은 컴포넌트 옆에 둔다. 전역 `src/style`에는 토큰·기반 스타일·실제 공유 규칙만 둔다.
- `PanelHeader`는 영역 제목 배치를, `FormField`는 라벨과 입력 영역을 소유한다. 부모가 내부 태그를 대상으로 덮어쓰지 않는다.
- 거의 같은 디자인은 작은 글자 크기 차이 등을 유지하지 않고 같은 공통 규칙으로 통일한다.
- 한 규칙에서만 쓰는 값은 해당 규칙에 직접 둔다. 공통 표면은 `components.scss`의 `.module`을 공유하며 불필요한 root 변수를 만들지 않는다. 새로운 전역 기본 변수가 꼭 필요하면 `base.scss`에 둔다.
- 기능 모듈마다 의미 있는 최상위 class를 하나 두어 검색 시작점을 만든다.
- 공통 토큰은 전역에서 관리하고, 페이지 배치와 도메인 상태 표현은 해당 모듈이 소유한다.
- markup과 style을 서로 다른 파일로 나눴다면 두 파일 이름을 같게 유지한다. 예: `SiteHeader.svelte`, `site-header.scss`.

## 버튼 유형

- 일반 폼 제출·작성 이동: `ui-button is-primary`. 글자 .9rem, 여백 .2rem .6rem.
- 보조 액션: `ui-button is-secondary`. 테두리와 연한 hover 배경으로 주요 액션과 구분한다.
- 삭제·차단 등 위험 액션: `ui-button is-danger`. 일반 취소를 위험 액션으로 취급하지 않는다. 테두리형 텍스트 액션이 필요한 곳은 `ui-button is-danger-outline`을 사용한다.
- 목록·도구 모음의 반복 액션: 위 색상 유형에 `is-compact`를 조합한다. 글자 .7rem, 여백 .4rem .6rem.
- 아이콘 조작: `ui-button is-icon`. 2rem 정사각형, padding 0, `flex: none`이며 기본 버튼의 Flex 중앙 정렬을 재사용한다.
- 수정 아이콘은 `ui-button is-icon is-primary`, 삭제 아이콘은 `ui-button is-icon is-danger`를 사용한다. 각각 파란색·빨간색 아이콘이며 배경과 테두리는 투명하고 hover·focus-visible 배경은 같은 회색이다. 아이콘 삭제에 `is-danger-outline`을 조합하지 않는다.
- 채움형 primary·danger 버튼은 hover 때 배경과 테두리를 함께 같은 색으로 변경한다.
- 링크와 button은 같은 클래스로 외형을 공유한다. 키보드 focus outline은 유지한다.
- 선택 탭, 편집기 도구, 시간표 칸, 강의 블록은 일반 액션 버튼과 다른 상호작용이다. 해당 컴포넌트가 모양과 선택 상태를 소유한다.
- 같은 역할·맥락의 버튼은 같은 유형을 쓴다. 모든 버튼을 하나의 크기나 형태로 통일하지 않는다.

## 공통 HTML/CSS 패턴

- 표면은 `.module`, 일반 영역 제목에는 `PanelHeader`를 쓴다. 같은 표면을 mixin 파일로 복제하지 않는다.
- 성적·졸업의 펼침 영역은 페이지 전용 `SectionHeading`을 쓰고, summary 배치는 해당 페이지에서 공유한다.
- 입력 라벨은 `FormField` 또는 네이티브 `label.form-field`로 같은 규칙을 쓴다. 체크박스 선택 카드는 `label.choice-option`을 쓴다.
- 게시물 목록은 `.content-list-item` 내부에만 적용되는 공통 규칙을 쓴다. 각 목록에는 도메인별 차이만 남긴다.
- 알림의 레이아웃은 공통 선택자로 한 번 선언하고 상태별로 색상만 바꾼다. 시간표 내 알림처럼 용도가 다른 배치는 전용 컴포넌트에 둔다.
- 길이·여백은 rem을 우선한다. 미디어 쿼리의 px는 요소의 크기와 계산 기준이 다르므로 일괄 나눗셈으로 바꾸지 않는다.

## 클래스 사용 우선순위

1. 기본 태그의 스타일과 상위 컨테이너의 배치를 먼저 활용한다.
2. 컴포넌트 내부 구조가 명확하면 `header > button`처럼 가까운 태그 관계로 표현한다.
3. 재사용되는 디자인, 상태, 형제 중 구분해야 할 요소에만 클래스를 붙인다. 같은 역할에 동의어 클래스를 추가하지 않는다.
4. 공통 표면을 붙인 뒤 border·shadow·padding을 모두 취소하는 대신 처음부터 필요한 기본 요소를 사용한다.
5. 단순 클래스 감소를 위해 긴 위치 선택자나 다른 컴포넌트 내부를 겨냥하는 전역 선택자를 만들지 않는다.

## 스타일 위치와 버튼 역할

- 컴포넌트 전용 SCSS를 분리해야 할 만큼 길면 해당 Svelte 파일 옆에 같은 이름으로 둔다. 단순한 규칙은 컴포넌트 안에 유지한다.
- 버튼의 형태·색상 조합은 위의 “버튼 유형”을 따른다. 폼이나 페이지에서 같은 상태 스타일을 다시 정의하지 않는다.
- 성공·경고·정보 색상은 결과 메시지에 사용한다. 저장 버튼의 색을 메시지 종류에 맞춰 늘리지 않는다.
- 시간표 좌표·그리드처럼 기능에 종속된 디자인은 해당 컴포넌트가 소유한다.

## 클래스 중복 방지

- 같은 역할과 디자인에는 같은 이름을 사용한다. 화면별 별칭이나 조합별 클래스를 만들지 않는다.
- `container`는 가로 중앙 정렬, `container-col`은 세로 중앙 정렬이다. flex 내부 요소를 위한 별도 inline 변형은 두지 않는다. 이미 배치를 소유한 컴포넌트에는 배치 클래스를 덧붙이지 않는다.
- 설정 입력 묶음은 `settings-form` 하나로 제목·필드 간격·실행 버튼 배치를 공유한다. 제목과 버튼에 별도 배치 클래스를 붙이지 않는다.
- 글 작업의 배치는 `ArticleHeader`가 소유하고, 수정·삭제 아이콘은 공통 버튼 디자인을 사용한다.

## 영역 제목

- 일반 영역은 `.module` 안에 `PanelHeader`를 배치한다. 제목은 `title`, 작업 요소는 기본 자식으로 전달한다. 설명은 선택적인 `description`으로 전달한다. 아이콘과 이름 있는 actions snippet은 제공하지 않는다.
- 성적·졸업은 페이지 전용 `SectionHeading`으로 아이콘·제목·선택적인 설명을 공유한다. `details`·`summary`·펼침 상태·본문은 각 기능이 소유하며 요약 설명은 헤더에 유지해 접힌 상태에서도 확인할 수 있게 한다.

## 모션 적용 원칙

- 일반 버튼의 색상 전환은 사용하지 않는다. 배너 전환·자동 넘김, 펼침 화살표 회전, 별점 확대, 모바일 메뉴 등장·퇴장, 로딩 진행 표시는 유지한다.
- 추후 공통 효과를 도입할 때는 지속 시간·easing 기본값을 `base.scss`에 두고, 버튼 등 역할별 공통 선택자에서 필요한 속성만 전환한다. `transition: all`이나 요소마다 별도의 animation 클래스를 추가하지 않는다.
- 등장·퇴장 효과는 실제로 필요한 공통 컴포넌트가 소유한다. `prefers-reduced-motion`에서는 전환을 비활성화한다.

## 콘텐츠 폼과 동작 줄이기

- 게시글·문의 작성 영역은 `content-form`으로 세로 간격을 공유한다. 메타데이터는 직접 자식 `.module`, 제출 버튼은 `footer`에 둔다. 화면별 배치 별칭은 만들지 않는다.
- CSS 전환은 `base.scss`에서 동작 줄이기 설정을 반영한다. Svelte 전환·배너 타이머·로딩 막대처럼 JavaScript가 제어하는 효과는 Svelte `MediaQuery`로 같은 설정의 변경을 반영한다.

## HTML과 크기 지정 최소화

- 배치·의미·동작을 묶을 필요가 있을 때만 래퍼를 둔다. 기존 `form`, `section`, `header`가 맡을 수 있는 역할을 위해 `div`를 추가하지 않는다.
- 일반 블록 흐름과 Flex/Grid의 기본 stretch를 먼저 활용한다. `width: 100%`는 실제로 필요한 경우에만 지정하며 공통 클래스의 너비를 로컬에서 반복하지 않는다.
- 부모의 중앙/시작 정렬 때문에 대부분의 자식에 전체 너비가 필요해졌다면 부모 정렬부터 검토한다. 현재 `.module`, `.page`, `.form-field` 등에 남은 너비를 일괄 제거하지 않는다.
- `min-width: 0`과 `min-height: 0`은 Flex/Grid 내부의 축소·스크롤에 필요할 수 있다. 말줄임과 긴 콘텐츠까지 확인한 뒤 제거한다.
- 아이콘과 텍스트 등 형제 간 간격은 부모의 `gap`을 우선한다. 반대편 배치를 위한 auto margin과 콘텐츠 내부 여백은 별개다.
- 내용의 시작·끝 방향을 뜻하는 여백은 `margin-inline-start`, `padding-inline` 등 논리 속성을 사용할 수 있다. 실제 좌표를 표현하는 시간표·오버레이에는 물리 방향 속성을 유지한다.
- `ActionForm`은 `form > fieldset` 구조이며 로딩 속성과 커서는 form, 일괄 비활성화는 fieldset이 소유한다. 바깥 너비 래퍼나 primary 버튼 색상 덮어쓰기를 추가하지 않는다.
- disabled 외형은 공통 버튼 규칙이 맡는다. 폼 전체와 버튼에 opacity를 중첩 적용하지 않는다.

## 반응형과 표준 CSS

- 너비 미디어 쿼리는 `(width <= ...)`, `(width > ...)`처럼 범위 문법으로 작성한다.
- 공통 모바일 경계는 `media.scss`의 768px이다. mobile은 `<=`, pc는 `>`를 사용하며 경계 회피용 `0.01rem` 계산을 추가하지 않는다. 기능별 경계가 필요한 경우 로컬에 둔다.
- SCSS는 계속 사용한다. 최신 문법 도입은 코드 단순화와 지원 브라우저에서의 동작을 기준으로 판단한다.
- 컨테이너 쿼리는 여러 폭의 영역에 재사용되는 컴포넌트에서 필요할 때 검토한다. 현재 전체 UI가 컨테이너 쿼리로 전환된 것은 아니다.
- 브라우저별 폼 컨트롤 선택자, 외부 스타일 덮어쓰기, reduced-motion의 `!important`는 목적을 확인하고 유지한다. 접두어나 `!important`만 보고 일괄 삭제하지 않는다.

## 정리 후 검증

- 중복 선언과 미사용 선택자를 먼저 제거하고, 부모 배치 변경과 자식 보정 제거는 함께 검토한다.
- `npm run check`, 변경 Svelte 파일의 ESLint, `node src/style/components.test.mjs`로 컴파일·구조 규칙을 확인한다.
- 자동 검사는 화면 동일성을 보장하지 않는다. 데스크톱·모바일, 긴 텍스트, hover·focus-visible·disabled·loading·오류 상태에서 실제 배치를 확인한다.
