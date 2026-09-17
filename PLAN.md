# PLAN — Vibe Coding UI Composer Implementation Plan

## 1. 목표
PRD에 정의된 Vibe Coding UI Composer를 단계적으로 구현한다.

초기 목표는 완성형 디자인 플랫폼이 아니라, 개인이 GitHub Pages에서 사용할 수 있는 안정적인 MVP를 만드는 것이다.

AI 관련 기능은 구현하지 않는다.

---

## 2. 구현 전략

구현 우선순위:

1. JSON Schema
2. Renderer
3. Canvas Editor
4. Grid / Layout
5. Properties
6. Theme / Style / Token
7. Responsive
8. Local Save
9. Preview
10. Export
11. 편집 편의 기능
12. Design Lint

중요 원칙:
- Editor보다 데이터 모델을 먼저 확정한다.
- Renderer와 Editor는 동일 JSON을 사용한다.
- Drag & Drop 로직과 실제 UI Rendering을 최대한 분리한다.
- React + Tailwind Export 가능성을 고려해 Layout Model을 설계한다.

---


## 2.1 Just-in-time 상세 문서 원칙

PRD에 모든 구현 세부사항을 미리 넣지 않는다.

각 Phase에서 실제 구현에 필요한 상세 명세만 해당 Phase 시작 직전에 작성한다.

권장 문서:
- Phase 1 전: `WIREFRAME.md` — Editor Shell, Panel 배치, 주요 상태
- Phase 2 전: `SCHEMA_SPEC.md` — Project JSON, Node, Responsive Override, Migration
- Phase 3 전: `COMPONENT_CATALOG.md` — Component Props, Variant, Constraint
- Phase 16 전: `EXPORT_SPEC.md` — 생성 파일, JSX/Tailwind Mapping, Token Export
- Phase 17 전: `LINT_RULES.md` — Rule ID, Severity, Detection 조건

이 문서들은 앞 Phase의 검증 결과를 반영해 작성한다.
아직 구현하지 않을 Phase의 상세 문서를 미리 확정하지 않는다.

---

## 3. Phase 0 — 기술 검증

### 목적
Editor Engine과 핵심 기술 스택을 결정한다.

### 검토 항목

#### Editor Engine
1순위:
- **Puck**

Fallback:
- dnd-kit 직접 구성

Puck 채택 이유:
- React Component 기반 Visual Editor 구조를 이미 제공
- Component Registry와 Drag & Drop 기본 기능 활용 가능
- Editor UI를 처음부터 모두 구현하지 않아도 됨
- 프로젝트의 핵심인 Grid / Token / Theme / Export 구현에 집중 가능

Puck 위에 직접 구현할 기능:
- 12-column Grid System
- Grid Snap Resize
- Design Token
- Theme / Style
- Responsive Override
- Block System
- App-owned Project JSON Schema
- React + Tailwind Export

Fallback 조건:
다음 중 하나가 구조적으로 해결되지 않을 경우에만 dnd-kit 기반 Custom Editor로 전환한다.
- Grid Column 단위 Resize가 자연스럽게 구현되지 않음
- Nested Layout 제어가 제한됨
- Breakpoint별 Responsive Override 구현이 어려움
- Custom Properties Panel 확장이 제한됨
- Editor State와 앱의 독립적인 Project Schema 분리가 어려움
- 필요한 Editor UX를 구현하기 위해 Puck 내부 구조를 과도하게 우회해야 함

검증 기준:
- Nested Component
- Drag & Drop
- Resize 확장 가능성
- Serializable State
- Custom Properties Panel
- Responsive State
- GitHub Pages 호환
- Bundle Size
- 유지보수 상태
- 라이선스

#### State Management
후보:
- Zustand

검토:
- History
- Undo / Redo
- Node Tree
- Selection State

#### Local Storage
- IndexedDB
- 필요 시 Dexie 같은 Wrapper 검토

#### Icon Library
검토:
- React 친화적 오픈소스 Icon Set
- Tree-shaking
- 라이선스
- Tailwind 및 Export 코드 호환성

### 산출물
- TECH_DECISION.md
- Puck 기반 PoC
- Puck 적합성 검증 결과
- 필요 시 dnd-kit fallback 판단
- 기본 프로젝트 Scaffold

---

## 4. Phase 1 — Project Foundation

### 목표
애플리케이션의 기본 구조를 만든다.

### 구현
- React + TypeScript + Vite
- Tailwind CSS
- GitHub Pages 배포 설정
- App Shell
- Top Bar
- Left Panel
- Canvas
- Right Properties Panel
- Structure Panel

### 완료 조건
- GitHub Pages에서 앱 접속 가능
- Editor 기본 Layout 표시
- 각 Panel Resize 또는 기본 크기 유지

---

## 5. Phase 2 — JSON Schema & Renderer

### 목표
UI를 표현하는 데이터 모델을 먼저 완성한다.

### 구현 대상

#### Project
- id
- name
- version
- createdAt
- updatedAt

#### Grid
- breakpoint별 columns
- gutter
- margin

#### Node
- id
- type
- children
- props
- layout
- style
- responsive

Project Schema에서는 `parentId`와 `children`을 동시에 영구 저장하지 않는다.
MVP는 `children: string[]`을 기준으로 Tree를 표현하고 Parent Lookup은 Runtime Index로 계산한다.

#### Theme
- color token

#### Style
- radius
- shadow
- typography
- density

### Renderer
JSON Node Tree를 React Component로 Rendering한다.

초기 지원 Node:
- Page
- Section
- Container
- Flex
- Grid
- Card
- Button
- Input
- Text

### 완료 조건
JSON만 수정해서 화면 구조가 변경된다.

---

## 6. Phase 3 — Component Registry

### 목표
Component를 등록하고 공통 Metadata로 관리한다.

### Component Metadata 예시
- type
- label
- icon
- category
- defaultProps
- defaultStyle
- variants
- allowedChildren
- canHaveChildren
- resizeRules
- propertySchema

### 초기 Component
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

### 완료 조건
Component Registry에 등록하면 Left Panel과 Renderer에 자동 반영된다.

---

## 7. Phase 4 — Canvas Drag & Drop

### 목표
Component를 실제로 Canvas에 배치할 수 있게 한다.

### 구현
- Component Library → Canvas Drag
- Canvas 내부 Reorder
- Nested Drop
- Selection
- Delete
- Duplicate
- Hover State
- Drop Indicator

### Constraint
- allowedChildren 검사
- Drop 가능 위치 제한

### 완료 조건
Component를 조립해 기본 화면 생성 가능

---

## 8. Phase 5 — Grid System

### 목표
자유로운 Pixel 배치가 아닌 Grid 기반 배치를 구현한다.

### 구현

#### 기본 Grid
Desktop:
- 12 Columns
- 24 Gutter
- 32 Margin

Tablet:
- 8 Columns
- 20 Gutter
- 24 Margin

Mobile:
- 4 Columns
- 16 Gutter
- 16 Margin

#### Grid Settings
- Column 변경
- Gutter 변경
- Margin 변경
- Grid Overlay On / Off

#### Resize
- Component Width Drag Resize
- Column Snap
- Min / Max Span

### 완료 조건
Component Width가 항상 Grid Column에 맞게 Resize된다.

---

## 9. Phase 6 — Layout Engine

### 목표
Component 내부 Layout을 구성한다.

### 지원
- Flex Row
- Flex Column
- Grid
- Stack

### Properties
- Direction
- Wrap
- Align
- Justify
- Gap
- Padding

### Height
- Auto
- Fixed
- Min Height
- Fill

### 완료 조건
Page Grid와 내부 Flex/Grid Layout을 함께 사용할 수 있다.

---

## 10. Phase 7 — Properties Panel

### 목표
선택한 Component 속성을 UI에서 수정한다.

### Tab

#### Layout
- Width
- Height
- Display
- Direction
- Gap
- Padding
- Align
- Justify

#### Typography
- Role
- Font
- Size
- Weight
- Line Height
- Letter Spacing

#### Appearance
- Background
- Text Color
- Border
- Radius
- Shadow

#### Responsive
- Desktop
- Tablet
- Mobile Override

### 완료 조건
Properties 변경 즉시 Canvas에 반영된다.

---

## 11. Phase 8 — Design Token

### 목표
마구잡이 값을 줄이고 일관된 디자인을 만든다.

### Spacing
- 0
- 4
- 8
- 12
- 16
- 24
- 32
- 40
- 48
- 64
- 80

### Radius
예:
- none
- sm
- md
- lg
- xl
- full

### Shadow
예:
- none
- sm
- md
- lg

### Typography Role
- Display
- Heading 1
- Heading 2
- Heading 3
- Title
- Body Large
- Body
- Body Small
- Caption

### 완료 조건
기본 Properties는 Token Selector로 동작한다.

---

## 12. Phase 9 — Theme / Style

### Theme
구현:
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

### Style
초기:
- Clean
- Soft
- Business
- Compact
- Glass

### 기능
- Project-level Style 변경
- Component Override
- Theme 변경
- Light / Dark 확장 가능한 구조

MVP Style은 Token Preset 방식으로 구현하고 Style별 별도 Component 구현은 만들지 않는다.

### Built-in Preset
- Clean Light
- Clean Dark
- Compact Dashboard

Built-in Preset은 정적 Resource로 제공하며 사용자가 직접 저장하는 My Preset은 Phase 18에서 구현한다.

### 완료 조건
Theme 또는 Style 변경 시 전체 UI가 일관되게 변경된다.

---

## 13. Phase 10 — Block & Layout Preset System

### 목표
반복 조립 작업과 초기 Page 구성을 줄인다.

### MVP Block
- Sidebar Navigation
- Page Header
- KPI Section
- Search + Filter

### MVP Layout Preset
- Blank
- Sidebar + Main
- Header + Content

Block은 여러 Node를 포함하는 JSON Fragment로 정의한다.
Layout Preset은 Project Root에 적용하는 초기 구조 Template로 정의한다.

### 완료 조건
- Block 하나를 Drag & Drop하면 여러 Component가 한 번에 삽입된다.
- 새 Project에서 Layout Preset을 선택해 기본 Page 구조를 만들 수 있다.

---

## 14. Phase 11 — Responsive

### 목표
Desktop 설계를 Tablet / Mobile로 확장한다.

### 구현
- Breakpoint Switch
- Breakpoint Grid
- Responsive Property Override
- 기본 Auto Stack Rule
- Overflow 검사

### Auto Rule 예
Desktop:
- Card 4 / 12 × 3

Tablet:
- 4 / 8 × 2 + 8 / 8

Mobile:
- 4 / 4 Stack

### 완료 조건
Breakpoint별 Layout을 독립적으로 조정할 수 있다.

---

## 15. Phase 12 — History & 기본 편집 도구

### MVP
- Undo
- Redo
- Duplicate
- Delete
- Lock

Undo / Redo History는 Runtime Memory에만 유지한다.
브라우저 재시작 이후 History 복원은 MVP 범위가 아니다.

### MVP 이후
- Multi-select
- Align Left / Center / Right
- Align Top / Middle / Bottom
- Equal Distribution
- Copy / Paste Style

### 완료 조건
주요 편집 작업을 안정적으로 되돌리고 Node를 잠글 수 있다.

---

## 16. Phase 13 — Structure Panel

### 목표
Node Tree를 시각적으로 관리한다.

### 기능
- Tree 구조
- Expand / Collapse
- Select
- Reorder
- Lock 표시
- Component 이름 표시

### 완료 조건
Canvas를 직접 클릭하지 않고도 모든 Node를 탐색할 수 있다.

---

## 17. Phase 14 — Local Persistence

### IndexedDB
MVP 저장:
- Project
- Theme / Style 설정
- Grid / Responsive / Component 상태

MVP 이후:
- My Preset
- My Component
- My Block
- Version Snapshot

### Auto Save
- Debounce 저장
- 마지막 수정 시각 표시

### JSON
- Export
- Import
- Schema Version 검증

### 완료 조건
브라우저 종료 후 다시 접속해도 작업 복원 가능

---

## 18. Phase 15 — Preview

### 목표
편집 UI를 제거한 실제 결과 화면을 확인한다.

### 구현
- Canvas Overlay 제거
- Desktop / Tablet / Mobile Preview
- Fullscreen Preview

### MVP Interaction
- Hover / Focus 같은 기본 CSS State

### v1 이후
- Tabs
- Modal
- Dropdown
- Toggle

### 완료 조건
편집용 Overlay 없이 Desktop / Tablet / Mobile의 실제 스타일을 확인할 수 있다.

---

## 19. Phase 16 — React + Tailwind Export

### 목표
완성된 화면을 실제 프로젝트 시작 코드로 활용한다.

### Export Pipeline

Project JSON
→ Normalize
→ Component Tree
→ React AST 또는 Template Generator
→ JSX
→ Tailwind Class

### 출력 예
- App.jsx 또는 Page Component
- components/
- styles 또는 token CSS
- README 또는 사용 메모

### Export 원칙
- 의미 없는 Absolute Position 금지
- Grid / Flex 유지
- 반복 구조 Component화
- 읽기 쉬운 JSX
- Tailwind Class 정리

### 완료 조건
Export 결과를 새 React 프로젝트에서 실행 가능

---

## 20. Phase 17 — Design Lint

MVP 완료 후 진행한다.

### 목표
디자인 일관성 문제를 Rule-based로 확인한다.

### 초기 Rule
- Token 외 Spacing
- 너무 작은 Font
- Contrast Warning
- Inconsistent Gap
- Inconsistent Button Height
- Grid Overflow
- Responsive Overflow

### UI
- Warning Badge
- Lint Panel
- Canvas Highlight

### 완료 조건
문제가 있는 Node 위치와 원인을 확인할 수 있다.

---

## 21. Phase 18 — Preset / Custom Library

MVP 안정화 이후 진행한다.

### Preset
- Theme + Style + Font + Density 저장

### My Component
선택한 Node를 재사용 Component로 저장

### My Block
선택한 Node Tree를 재사용 Block으로 저장

### 완료 조건
개인 Design System을 누적할 수 있다.

---

## 22. MVP Cut Line

초기 MVP는 아래 Phase를 완료한다.

필수:
- Phase 0~11
- Phase 12의 Undo / Redo / Duplicate / Delete / Lock
- Phase 13
- Phase 14
- Phase 15
- Phase 16

Phase 10은 기본 Block 4종과 Layout Preset 3종만 구현한다.

MVP 이후:
- Multi-select / Align / Distribution
- Design Lint
- My Component
- My Block
- My Preset
- Command Palette
- Copy / Paste Style
- Advanced Interaction

---

## 23. 권장 Milestone

### Milestone 1 — Renderable JSON
목표:
JSON → UI Rendering

포함:
- Schema
- Renderer
- 기본 Component

### Milestone 2 — Editable Canvas
목표:
UI를 Drag & Drop으로 조립

포함:
- Canvas
- DnD
- Selection
- Properties

### Milestone 3 — Design System
목표:
일관된 UI 생성

포함:
- Grid
- Token
- Theme
- Style
- Typography

### Milestone 4 — Responsive Editor
목표:
Desktop / Tablet / Mobile

### Milestone 5 — Persistent Tool
목표:
IndexedDB + Import / Export

### Milestone 6 — Production Export
목표:
React + Tailwind Code Export

### Milestone 7 — Quality Tools
목표:
Lint / Custom Library / Workflow 개선

---

## 24. 테스트 계획

### Unit Test
- Schema
- Token
- Grid 계산
- Responsive Rule
- Export Mapping

### Component Test
- Properties
- Component Registry
- Renderer

### Integration Test
- Drag → Save → Reload
- Resize → Responsive → Export
- JSON Export → Import

### Manual Test
대표 화면 제작:
1. Dashboard
2. Login
3. Settings
4. Data Table Page

각 화면을 처음부터 만들어 사용성을 점검한다.

---

## 25. Definition of Done

MVP 완료 조건:

- GitHub Pages에서 실행된다.
- 서버가 필요 없다.
- 새 프로젝트를 만들 수 있다.
- Component를 Drag & Drop할 수 있다.
- Grid에 맞춰 Resize할 수 있다.
- Grid Column 수를 변경할 수 있다.
- Spacing / Typography Token을 사용할 수 있다.
- Theme / Style을 변경할 수 있다.
- Desktop / Tablet / Mobile을 편집할 수 있다.
- Undo / Redo가 동작한다.
- Structure Panel에서 Node를 관리할 수 있다.
- 프로젝트가 IndexedDB에 자동 저장된다.
- JSON Import / Export가 가능하다.
- Preview가 가능하다.
- React + Tailwind CSS 코드로 Export할 수 있다.
- AI 관련 기능이 존재하지 않는다.

---

## 26. 구현 시 주의사항

### Editor Engine 종속성
Puck의 내부 데이터 모델을 Project Schema로 사용하지 않는다.

Project Schema는 앱 자체가 소유하며 Puck은 Editor Layer로만 사용한다.

Puck과 Project Schema 사이에는 Adapter Layer를 두어, 향후 dnd-kit 등 다른 Editor Engine으로 교체할 수 있도록 한다.

### Export 가능성
Editor에서는 가능하지만 React / Tailwind로 자연스럽게 표현하기 어려운 기능은 제한한다.

### 과도한 자유도 방지
사용자 편의를 위해 Custom 값을 허용하더라도 기본 UI에서는 Token과 Preset을 우선한다.

### GitHub Pages
Client-side Routing 및 Asset Path가 GitHub Pages와 충돌하지 않도록 설정한다.

### Schema Migration
Project JSON에는 schemaVersion을 포함한다.

---

## 27. 다음 작업
1. Phase 0 Puck PoC 수행
2. Puck 적합성 PASS / fallback 판단
3. Project JSON Schema 초안 작성
4. Editor Wireframe 확정
5. Phase 1부터 PHASE_GUIDE 기준으로 구현 / 테스트 반복

---
