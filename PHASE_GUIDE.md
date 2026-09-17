# PHASE_GUIDE — Vibe Coding UI Composer

## 1. 문서 목적

이 문서는 Vibe Coding UI Composer를 한 번에 구현하지 않고, 작은 단위로 구현하고 검증한 뒤 다음 단계로 진행하기 위한 실행 가이드다.

기본 원칙은 다음과 같다.

```text
구현
 ↓
테스트
 ↓
PASS?
 ├─ NO → 수정 → 재테스트
 └─ YES
      ↓
   결과 기록
      ↓
   Commit / Tag
      ↓
   다음 Phase
```

각 Phase는 독립적으로 완료 가능한 수준으로 유지한다.

---

## 2. 공통 Phase Gate

모든 Phase는 아래 기준을 통과해야 다음 단계로 진행한다.

### 공통 PASS 조건
- 해당 Phase의 필수 기능이 모두 동작한다.
- Build가 성공한다.
- Console Error가 없다.
- 기존 완료 기능이 깨지지 않는다.
- 테스트 체크리스트를 통과한다.
- Known Issue가 있으면 기록한다.
- 구현 범위를 넘긴 기능이 섞이지 않는다.

### 공통 FAIL 조건
- 핵심 기능이 불안정하다.
- 기존 Phase 기능이 깨진다.
- 데이터 구조가 계획과 다르게 변형된다.
- 임시 Hack이 다음 Phase에 영향을 준다.
- Puck 내부 구조에 Project Schema가 종속된다.

FAIL이면 다음 Phase로 넘어가지 않는다.

---


## 2.1 Phase별 보조 문서

모든 상세 문서를 처음부터 만들지 않는다.
해당 Phase를 시작하기 직전에 필요한 문서만 작성하고, 완료 결과에 따라 수정한다.

| 시점 | 문서 | 목적 |
|---|---|---|
| Phase 1 시작 전 | `WIREFRAME.md` | Editor Shell과 Panel UX 확정 |
| Phase 2 시작 전 | `SCHEMA_SPEC.md` | Project JSON 구조 확정 |
| Phase 3 시작 전 | `COMPONENT_CATALOG.md` | Component Props / Variant / Constraint 확정 |
| Phase 16 시작 전 | `EXPORT_SPEC.md` | React + Tailwind Export 규칙 확정 |
| Phase 17 시작 전 | `LINT_RULES.md` | Design Lint 규칙 확정 |

보조 문서는 상위 문서인 PRD / PLAN / TECH_DECISION과 충돌하면 안 된다.
충돌할 경우 상위 결정부터 수정한 뒤 구현한다.

---

# Phase 0 — Technical Validation

## 목표
Puck을 실제 Editor Engine으로 사용할 수 있는지 검증한다.

## 구현 범위
- React + TypeScript + Vite Scaffold
- Puck 최소 Editor 실행
- Custom Component 등록
- Nested Component 테스트
- Custom Properties Panel 테스트
- 최소 Spike Schema 기반 Project JSON ↔ Puck Adapter PoC
- 12-column Grid Overlay PoC
- Grid Snap Resize 가능성 검증
- Responsive Override 가능성 검증
- GitHub Pages Build 검증

## 하지 않을 것
- 완성된 UI
- Theme System
- Design Token 완성
- IndexedDB
- Code Export
- Design Lint

## 테스트
- [ ] Puck Editor가 로컬에서 실행된다.
- [ ] Custom Component가 등록된다.
- [ ] Page > Section > Grid > Card 구조가 동작한다.
- [ ] Properties 변경이 Component에 반영된다.
- [ ] 최소 Spike Schema와 Puck State를 분리할 수 있다.
- [ ] Grid Span을 외부 State로 관리할 수 있다.
- [ ] Responsive 값을 Node별로 저장할 수 있다.
- [ ] GitHub Pages용 Build가 성공한다.

## 완료 조건
Puck 유지 조건을 충족하면 PASS.

구조적 제약이 확인되면 TECH_DECISION 기준으로 dnd-kit fallback을 검토한다.

---

# Phase 1 — Project Foundation

## 목표
Editor 기본 Shell을 완성한다.

## 구현 범위
- App Shell
- Top Bar
- Left Panel
- Canvas
- Structure Panel 영역
- Right Properties Panel
- 기본 Responsive Layout
- GitHub Pages 배포 설정

## 하지 않을 것
- Drag & Drop
- Component 편집
- Grid 기능
- 저장
- Theme

## 테스트
- [ ] 각 Panel이 정상 표시된다.
- [ ] Browser Resize 시 Editor Layout이 깨지지 않는다.
- [ ] Build가 성공한다.
- [ ] GitHub Pages에서 접속된다.
- [ ] 새로고침 시 오류가 없다.

## 완료 조건
Editor Shell이 안정적으로 동작하면 PASS.

---

# Phase 2 — Project JSON Schema & Renderer

## 목표
Project JSON을 앱의 Single Source of Truth로 만든다.

## 구현 범위
- schemaVersion
- Project
- Grid
- Node(`children: string[]` 기준, `parentId` 영구저장 제외)
- Theme 참조
- Style 참조
- Responsive 구조
- JSON → React Renderer
- 기본 Node 렌더링

초기 Node:
- Page
- Section
- Container
- Flex
- Grid
- Card
- Text
- Button
- Input

## 하지 않을 것
- Drag & Drop
- Resize
- IndexedDB
- Code Export

## 테스트
- [ ] JSON만 수정해 화면 구성이 바뀐다.
- [ ] Nested Node가 렌더링된다.
- [ ] 잘못된 Node Type이 안전하게 처리된다.
- [ ] schemaVersion이 포함된다.
- [ ] Puck Type이 Project Schema에 직접 포함되지 않는다.

## 완료 조건
Renderer가 Editor 없이도 Project JSON만으로 동작하면 PASS.

---

# Phase 3 — Component Registry

## 목표
Component 정의와 Editor 표시 정보를 한 곳에서 관리한다.

## 구현 범위
- Component Registry
- Category
- Default Props
- Variant
- allowedChildren
- canHaveChildren
- resizeRules
- propertySchema

초기 Component:
- Page
- Section
- Container
- Flex
- Grid
- Card
- Text
- Button
- Input
- Select
- Badge
- Divider
- Table

## 하지 않을 것
- Block Library
- My Component
- Theme Preset

## 테스트
- [ ] Registry 등록만으로 Left Panel에 표시된다.
- [ ] Registry 등록만으로 Renderer가 Component를 찾는다.
- [ ] Default Props가 적용된다.
- [ ] 허용되지 않은 Child 규칙을 판단할 수 있다.

## 완료 조건
새 Component 추가 시 여러 파일을 수정하지 않아도 되는 구조면 PASS.

---

# Phase 4 — Canvas Drag & Drop

## 목표
Component를 Canvas에 조립할 수 있게 한다.

## 구현 범위
- Library → Canvas Drag
- Canvas 내부 Reorder
- Nested Drop
- Selection
- Delete
- Duplicate
- Drop Indicator
- Drop Constraint

## 하지 않을 것
- Grid Resize
- Responsive
- Multi-select
- Theme

## 테스트
- [ ] Component를 Canvas에 추가할 수 있다.
- [ ] 순서를 변경할 수 있다.
- [ ] Nested Container 안에 Drop할 수 있다.
- [ ] 허용되지 않은 위치에는 Drop되지 않는다.
- [ ] 선택과 삭제가 동작한다.
- [ ] Duplicate가 동작한다.

## 완료 조건
기본적인 Page 조립이 가능하면 PASS.

---

# Phase 5 — Grid System

## 목표
자유 Pixel 배치가 아니라 Grid 기반 배치를 구현한다.

## 구현 범위
- Desktop 12-column Grid
- Column Preset
- Gutter
- Outer Margin
- Grid Overlay
- Width Span
- Grid Snap Resize
- Min / Max Span

## 하지 않을 것
- Tablet / Mobile Override
- Theme
- Typography
- Design Lint

## 테스트
- [ ] 12-column Overlay가 정확히 표시된다.
- [ ] Column 수 변경이 반영된다.
- [ ] Gutter와 Margin이 반영된다.
- [ ] Resize 시 Column 단위로 Snap된다.
- [ ] 최소/최대 Span을 넘지 않는다.
- [ ] Grid Hide 시 실제 Layout은 유지된다.

## 완료 조건
Component Width를 px가 아니라 Span으로 안정적으로 관리하면 PASS.

---

# Phase 6 — Layout Engine

## 목표
Component 내부 Layout을 구성한다.

## 구현 범위
- Flex Row
- Flex Column
- CSS Grid
- Stack
- Direction
- Wrap
- Align
- Justify
- Gap
- Padding
- Height Mode

## 하지 않을 것
- Breakpoint Override
- Theme Preset
- Design Lint

## 테스트
- [ ] Flex Row/Column 전환이 된다.
- [ ] Align/Justify가 즉시 반영된다.
- [ ] Gap/Padding이 Token 값으로 적용된다.
- [ ] Height Auto/Fixed/Min/Fill이 동작한다.
- [ ] Nested Layout이 깨지지 않는다.

## 완료 조건
Page Grid와 내부 Layout을 함께 사용할 수 있으면 PASS.

---

# Phase 7 — Properties Panel

## 목표
선택된 Component를 UI로 편집한다.

## 구현 범위
- Layout
- Size
- Spacing
- Typography
- Appearance
- Component Props

## 하지 않을 것
- Responsive Override
- Advanced Custom CSS
- Copy/Paste Style

## 테스트
- [ ] Component 선택 시 올바른 Properties가 표시된다.
- [ ] 값 변경이 즉시 Canvas에 반영된다.
- [ ] 다른 Component 선택 시 Panel이 갱신된다.
- [ ] 지원하지 않는 속성은 노출되지 않는다.

## 완료 조건
기본 Component 편집을 코드 수정 없이 수행할 수 있으면 PASS.

---

# Phase 8 — Design Token

## 목표
Spacing, Radius, Typography 등을 일관되게 관리한다.

## 구현 범위
- Spacing Token
- Radius Token
- Shadow Token
- Typography Role
- Token Selector

## 하지 않을 것
- Custom Token Editor
- Theme Preset
- Lint

## 테스트
- [ ] Properties에서 Token을 선택할 수 있다.
- [ ] Token 변경 시 실제 스타일이 변한다.
- [ ] Component별 동일 Token 결과가 일관된다.
- [ ] 임의 px 입력 없이 기본 편집이 가능하다.

## 완료 조건
기본 UI를 Token만으로 구성할 수 있으면 PASS.

---

# Phase 9 — Theme & Style

## 목표
프로젝트 전체 디자인 성격을 변경할 수 있게 한다.

## 구현 범위
Theme:
- Primary
- Secondary
- Background
- Surface
- Text
- Muted
- Border
- Success
- Warning
- Danger

Style:
- Clean
- Soft
- Business
- Compact
- Glass

## Built-in Preset
- Clean Light
- Clean Dark
- Compact Dashboard

## 하지 않을 것
- My Preset 저장
- Custom Theme Builder 고도화

## 테스트
- [ ] Theme 변경 시 전체 Color Token이 반영된다.
- [ ] Style 변경 시 Radius/Shadow/Density가 바뀐다.
- [ ] Component Override가 전역 설정보다 우선한다.
- [ ] Style 변경이 Layout 구조를 파괴하지 않는다.
- [ ] Built-in Preset 선택 시 Theme / Style / Font / Density가 함께 반영된다.

## 완료 조건
같은 화면을 Theme/Style 변경만으로 다른 성격으로 표현할 수 있으면 PASS.

---

# Phase 10 — Block & Layout Preset System

## 목표
반복되는 Component 조합과 초기 Page 구조를 빠르게 만든다.

## MVP Block
- Sidebar Navigation
- Page Header
- KPI Section
- Search + Filter

## MVP Layout Preset
- Blank
- Sidebar + Main
- Header + Content

## 구현 범위
- Block JSON Fragment
- Block Library
- Block 삽입
- ID 재생성
- Layout Preset 적용
- 새 Project Root 구조 생성

## 하지 않을 것
- My Block 저장
- Custom Layout Preset 저장
- Block Marketplace

## 테스트
- [ ] Block 하나로 여러 Node가 삽입된다.
- [ ] Node ID 충돌이 없다.
- [ ] 삽입 후 개별 Component 편집이 가능하다.
- [ ] Layout Preset으로 새 Project 구조를 만들 수 있다.
- [ ] Preset 적용 후 생성된 Node를 일반 Component처럼 수정할 수 있다.

## 완료 조건
기본 Block 4종과 Layout Preset 3종이 안정적으로 동작하면 PASS.

---

# Phase 11 — Responsive

## 목표
Desktop / Tablet / Mobile을 관리한다.

## 구현 범위
- Desktop
- Tablet
- Mobile
- Breakpoint Switch
- Grid 변경
- Property Override
- 기본 Auto Stack Rule
- Overflow 처리

## 하지 않을 것
- 복잡한 Custom Breakpoint Builder
- Device Simulator

## 테스트
- [ ] Desktop 변경이 기본값으로 하위 Breakpoint에 전달된다.
- [ ] Tablet/Mobile Override가 가능하다.
- [ ] Override가 Desktop 값을 파괴하지 않는다.
- [ ] 3열 Card가 Mobile에서 Stack된다.
- [ ] Overflow가 발생하지 않는다.

## 완료 조건
대표 Dashboard가 3개 Breakpoint에서 자연스럽게 표시되면 PASS.

---

# Phase 12 — History & Basic Editing

## 목표
실수 복구와 기본 편집 생산성을 확보한다.

## MVP 필수
- Undo
- Redo
- Duplicate
- Delete
- Lock

History는 Runtime Memory에만 유지한다.
브라우저 재시작 후 Undo / Redo 복원은 하지 않는다.

## MVP 이후
- Multi-select
- Align
- Distribution
- Copy / Paste Style

## 테스트
- [ ] Add를 Undo할 수 있다.
- [ ] Delete를 Undo할 수 있다.
- [ ] Property 변경을 Undo할 수 있다.
- [ ] Resize를 Undo할 수 있다.
- [ ] 여러 번 Undo/Redo해도 State가 깨지지 않는다.
- [ ] Duplicate 후 ID가 중복되지 않는다.
- [ ] Lock된 Node는 Canvas에서 이동/Resize되지 않는다.

## 완료 조건
주요 편집 작업의 History와 Lock이 안정적으로 동작하면 PASS.

---

# Phase 13 — Structure Panel

## 목표
Node Tree에서 화면 구조를 관리한다.

## 구현 범위
- Tree
- Expand / Collapse
- Selection Sync
- Reorder
- Lock 표시
- Component 이름

## 하지 않을 것
- 검색
- 대규모 Tree 최적화

## 테스트
- [ ] Canvas 선택과 Tree 선택이 동기화된다.
- [ ] Tree Reorder가 Canvas에 반영된다.
- [ ] Nested 구조가 정확히 표시된다.
- [ ] Lock 상태가 표시된다.

## 완료 조건
Canvas를 클릭하지 않고도 모든 Node를 탐색할 수 있으면 PASS.

---

# Phase 14 — Local Persistence

## 목표
서버 없이 작업 상태를 유지한다.

## 구현 범위
- IndexedDB
- Auto Save
- Project List
- Last Modified
- Project Theme / Style / Grid / Responsive / Component State 저장
- JSON Export
- JSON Import
- schemaVersion Validation

Undo / Redo History는 저장하지 않는다.

## 하지 않을 것
- Cloud Sync
- Login
- 협업
- Google Drive Sync

## 테스트
- [ ] 새로고침 후 Project가 복원된다.
- [ ] Browser 재실행 후에도 Project가 남아 있다.
- [ ] JSON Export 후 Import가 동일 결과를 만든다.
- [ ] 잘못된 JSON을 안전하게 거부한다.
- [ ] 다른 schemaVersion에 대한 오류를 표시한다.

## 완료 조건
로컬 프로젝트를 안정적으로 저장/복원할 수 있으면 PASS.

---

# Phase 15 — Preview

## 목표
Editor Overlay 없이 실제 결과를 확인한다.

## MVP 구현 범위
- Grid 제거
- Selection 제거
- Resize Handle 제거
- Desktop / Tablet / Mobile Preview
- Fullscreen
- Hover / Focus

## 하지 않을 것
- 복잡한 Prototype
- Navigation Flow
- Animation Timeline

## 테스트
- [ ] Editor Overlay가 보이지 않는다.
- [ ] Canvas와 Preview 스타일이 동일하다.
- [ ] Breakpoint Preview가 정확하다.
- [ ] Hover/Focus 상태가 정상이다.

## 완료 조건
실제 결과 화면을 검토할 수 있으면 PASS.

---

# Phase 16 — React + Tailwind Export

## 목표
UI를 실제 Vibe Coding 프로젝트의 시작 코드로 내보낸다.

## 구현 범위
- Project JSON Normalize
- Component Tree 변환
- JSX 생성
- Tailwind Class 생성
- Token CSS / CSS Variable
- 기본 파일 구조 생성

## 하지 않을 것
- Vue
- Svelte
- Angular
- HTML-only Export

## 테스트
- [ ] Export 결과가 Build된다.
- [ ] Canvas와 Export 화면이 시각적으로 유사하다.
- [ ] Grid/Flex 구조가 유지된다.
- [ ] Absolute Position이 불필요하게 생성되지 않는다.
- [ ] Component 계층이 읽을 수 있다.
- [ ] Token이 코드에 일관되게 반영된다.

## 완료 조건
Export한 결과를 새 React + Tailwind 프로젝트에서 실행할 수 있으면 PASS.

---

# Phase 17 — Design Lint

## 상태
MVP 완료 후 진행한다.

## 목표
일관성 문제를 Rule-based로 확인한다.

## 초기 Rule
- Token 외 Spacing
- 너무 작은 Font
- Contrast Warning
- Inconsistent Gap
- Inconsistent Button Height
- Grid Overflow
- Responsive Overflow

## 테스트
- [ ] 문제 Node를 찾는다.
- [ ] Warning 원인을 표시한다.
- [ ] Warning이 편집을 막지 않는다.
- [ ] False Positive를 최소화한다.

---

# Phase 18 — Personal Library

## 상태
MVP 안정화 이후 진행한다.

## 구현
- My Preset
- My Component
- My Block
- Copy / Paste Style
- Command Palette

---

## 3. Phase 완료 기록 Template

각 Phase 완료 시 아래 형식으로 기록한다.

```text
# Phase N Result

Date:
Status: PASS / FAIL / PARTIAL

Implemented
-

Tests
- Passed:
- Failed:

Known Issues
-

Deferred
-

Technical Decisions
-

Next Phase
-
```

권장 위치:

```text
docs/
└ phase-results/
   ├ phase-00.md
   ├ phase-01.md
   └ ...
```

---

## 4. 구현 작업 지시 원칙

Coding Agent 또는 Vibe Coding Tool에 작업을 맡길 때 한 번에 하나의 Phase만 요청한다.

권장 Prompt 구조:

```text
PRD.md, PLAN.md, TECH_DECISION.md, PHASE_GUIDE.md를 먼저 확인한다.

현재 작업은 Phase 5 — Grid System만 수행한다.

PHASE_GUIDE.md에 정의된 구현 범위만 구현하고
'하지 않을 것'에 포함된 기능은 추가하지 않는다.

구현 후 해당 Phase의 테스트 체크리스트를 실행한다.

테스트 실패 시 다음 Phase로 진행하지 말고 현재 Phase에서 수정한다.

완료 후 phase-results/phase-05.md에 결과를 기록한다.
```

이 원칙을 통해 Scope Creep을 방지한다.
