# PRD — Vibe Coding UI Composer

## 1. 문서 목적
이 문서는 개인용 Vibe Coding UI Composer의 제품 요구사항을 정의한다.

이 도구의 목적은 Figma처럼 모든 디자인을 자유롭게 만드는 것이 아니라, 미리 정의된 Component와 Block을 Grid, Design Token, Theme, Style 규칙 안에서 빠르게 조립하고, 그 결과를 실제 개발 가능한 React + Tailwind CSS 코드로 내보내는 것이다.

AI 생성, AI Agent, Prompt 기반 UI 생성 기능은 포함하지 않는다.

---

## 2. 제품 개요

### 2.1 제품 한 줄 정의
Grid와 Design Token 제약 안에서 웹앱 UI를 빠르게 조립하고 React + Tailwind CSS 코드로 Export하는 개인용 Visual UI Composer.

### 2.2 주요 사용 목적
- Vibe Coding 전에 UI 구조를 직접 확정한다.
- 매번 자연어로 UI를 수정하는 반복을 줄인다.
- 자주 사용하는 Component, Block, Theme, Style을 재사용한다.
- 디자인 경험이 많지 않아도 일정 수준 이상의 일관된 UI를 만든다.
- 만든 UI를 React + Tailwind CSS 코드로 내보내 실제 구현에 활용한다.

### 2.3 주요 사용 환경
- 개인용 웹앱
- GitHub Pages 배포
- 서버 없음
- 로그인 없음
- 브라우저 로컬 저장
- Desktop 우선
- 최신 Chromium 기반 브라우저 우선 지원

---

## 3. 제품 원칙

### 3.1 자유 배치보다 구조화된 조립
Absolute Position 기반 자유 배치를 기본 제공하지 않는다.

사용자는 Page Grid, Flex, Grid Container 안에서 Component를 배치한다.

### 3.2 자유로운 값보다 Design Token 우선
Spacing, Typography, Radius, Shadow 등의 값은 미리 정의된 Token을 기본으로 사용한다.

### 3.3 Single Source of Truth
Canvas 상태를 코드 자체가 아니라 JSON Schema로 저장한다.

JSON Schema는 다음 기능의 공통 원본으로 사용한다.

- Canvas Rendering
- Preview
- Project Save
- JSON Import / Export
- React + Tailwind CSS Export

### 3.4 개인 사용 최적화
협업, 권한 관리, 로그인, 서버 동기화 기능은 초기 범위에서 제외한다.

### 3.5 AI 비사용
AI 생성, AI 추천, AI Agent, Prompt-to-UI 기능은 포함하지 않는다.

---

## 4. 참고 방향

### 4.1 OpenPage에서 참고할 부분
- JSON-first 구조
- Visual Editor와 Renderer 분리
- Component / Block 기반 구성
- Theme 구조
- 동일 데이터 원본을 Editor와 Preview가 공유하는 방식

AI Site Generation, Gemini 연동, Agent 기능은 참고하거나 구현하지 않는다.

### 4.2 Easyblocks에서 참고할 부분
- Design Token
- Component Constraint
- Responsive Styling
- Variant
- Template / Preset
- Undo / Redo
- Multi-selection

### 4.3 Editor Framework 방향
Editor Framework는 **Puck을 1순위로 채택**한다.

참고할 부분:
- React Component Registry
- Drag & Drop Editor Architecture
- Serializable Editor State
- Custom Component 등록 방식

Project JSON Schema는 Puck과 분리하며, Puck이 핵심 Grid / Responsive UX를 구조적으로 제한할 경우에만 dnd-kit 기반 Custom Editor로 전환한다.

Craft.js는 현재 우선순위에서 제외하고 필요 시 재검토한다.

---

## 5. 대상 사용자
주 사용자는 개발자가 아닌 개인 사용자 또는 Vibe Coding을 자주 사용하는 사용자다.

주요 특성:
- 웹앱을 자주 만든다.
- UI를 코드로 직접 세밀하게 설계하는 것보다 시각적으로 먼저 구성하는 것을 선호한다.
- 깔끔한 웹 스타일을 선호한다.
- 완성된 디자인보다 구현 가능한 UI 구조를 빠르게 만드는 것이 중요하다.

---

## 6. 핵심 사용자 흐름

1. 새 프로젝트 생성
2. 기본 Layout Preset 또는 빈 Canvas 선택
3. Theme / Style 선택
4. 필요 시 기본 제공 Preset 선택
5. Component 또는 Block을 Canvas에 Drag & Drop
6. Grid 기준으로 크기 조절
7. Properties Panel에서 Layout / Typography / Appearance 수정
8. Desktop / Tablet / Mobile 확인
9. Preview Mode에서 실제 화면 확인
10. 프로젝트 자동 저장
11. 필요 시 JSON 백업
12. React + Tailwind CSS Export

MVP 이후에는 Design Lint로 일관성 문제를 추가 점검한다.

---

## 7. 정보 구조

### 7.1 주요 화면 영역

#### Top Bar
- 프로젝트 이름
- Undo / Redo
- Breakpoint 전환
- Grid 표시 / 숨김
- Preview
- Export

#### Left Panel
MVP:
- Components
- Blocks
- Layout Presets

MVP 이후:
- My Components
- My Blocks

#### Structure Panel
- Page Tree
- Section / Container / Component 계층
- 선택
- Lock 상태 표시
- 순서 변경

#### Canvas
MVP:
- Drag & Drop
- Grid 표시
- Resize Handle
- Selection Outline
- Responsive Preview

MVP 이후:
- Alignment Guide

#### Right Properties Panel
- Layout
- Size
- Spacing
- Typography
- Appearance
- Responsive Override

---

## 8. Layout System

### 8.1 Page Grid
기본 Responsive Grid:

#### Desktop
- Columns: 12
- Gutter: 24px
- Outer Margin: 32px

#### Tablet
- Columns: 8
- Gutter: 20px
- Outer Margin: 24px

#### Mobile
- Columns: 4
- Gutter: 16px
- Outer Margin: 16px

기본 Breakpoint 기준:
- Mobile: 0–767px
- Tablet: 768–1023px
- Desktop: 1024px 이상

기본 Preview Width:
- Mobile: 390px
- Tablet: 768px
- Desktop: 1440px

사용자는 Column 수를 변경할 수 있다.

기본 Preset:
- 4
- 6
- 8
- 12
- 16
- Custom

### 8.2 Grid Snap
Component Width는 Page Grid Column에 Snap된다.

예:
- 3 / 12
- 4 / 12
- 6 / 12
- 8 / 12
- 12 / 12

마우스로 Resize할 때도 Column 단위로 조절한다.

### 8.3 Component Height
Width와 달리 Height는 Grid Column에 강제하지 않는다.

지원:
- Auto
- Fixed
- Min Height
- Fill

`Hug Content`은 웹 구현상 `Auto`와 중복되므로 별도 Mode로 두지 않는다.

### 8.4 내부 Layout
Page Grid와 Component 내부 Layout을 분리한다.

지원:
- Flex Row
- Flex Column
- CSS Grid
- Stack

주요 속성:
- Direction
- Gap
- Align
- Justify
- Wrap

---

## 9. Spacing System

Base Unit은 4px로 한다.

기본 Scale:
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

권장 범위:

### Component Padding
- 8
- 12
- 16
- 24
- 32

### Component Gap
- 8
- 12
- 16
- 24
- 32

### Section Gap
- 24
- 32
- 48
- 64
- 80

Custom 값 입력은 Advanced 옵션으로 둘 수 있으나 기본 UI에서는 Token 선택을 우선한다.

---

## 10. Typography System

기본 Typography Role:
- Display
- Heading 1
- Heading 2
- Heading 3
- Title
- Body Large
- Body
- Body Small
- Caption

기본 Font는 변경 가능해야 한다.

초기 기본 Font 후보:
- Pretendard
- system-ui

각 Role은 다음 속성을 가진다.
- Font Family
- Font Size
- Font Weight
- Line Height
- Letter Spacing

Component에서 Role을 선택할 수 있고 필요 시 개별 Override를 허용한다.

---

## 11. Theme / Style / Preset

### 11.1 Theme
색상을 관리한다.

기본 Token:
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

### 11.2 Style
UI의 전반적인 시각 성격을 정의한다.

초기 Style:
- Clean
- Soft
- Business
- Compact
- Glass

Style이 관리하는 영역:
- Radius
- Shadow
- Default Spacing 성향
- Component Height
- Border 강도
- Typography 성향

MVP에서 Style은 주로 Design Token Preset으로 동작한다.
Style마다 별도의 Component 구현을 여러 벌 만드는 방식은 사용하지 않는다.

### 11.3 Preset

#### MVP Built-in Preset
Theme + Style + Font + Density 조합을 앱에 기본 제공한다.

초기 예:
- Clean Light
- Clean Dark
- Compact Dashboard

Built-in Preset은 정적 Resource이므로 별도 저장 기능이 필요하지 않는다.

#### MVP 이후 My Preset
사용자가 현재 Theme + Style + Font + Density 조합을 직접 저장한다.

예:
- My Default
- My Dashboard
- My Dark

---

## 12. Component System

### 12.1 Component 범위

#### MVP Core Component

Layout:
- Page
- Section
- Container
- Flex
- Grid

Basic:
- Text
- Button
- Input
- Select
- Card
- Badge
- Divider
- Table

Dashboard 구조의 Header, Sidebar, KPI Section 등은 기본 Component 조합으로 만든 Block으로 제공한다.

#### MVP 이후 확장 Component
- Textarea
- Checkbox
- Radio
- Toggle
- Icon Button
- Avatar
- Progress
- Chart Placeholder
- Modal
- Alert
- Toast
- Tabs

MVP에서는 Component가 시각적 UI 구조와 Sample Props를 표현하는 데 집중한다.
API 연결, 데이터 Binding, 실제 Business Logic은 포함하지 않는다.

### 12.2 Component Variant
예:

Button:
- Primary
- Secondary
- Ghost
- Danger

Card:
- Basic
- KPI
- Interactive

### 12.3 Component Constraint
각 Component는 허용 가능한 Child, Width, Layout, Variant 범위를 정의할 수 있다.

---

## 13. Block System

Component보다 큰 재사용 단위다.

MVP 기본 Block:
- Sidebar Navigation
- Page Header
- KPI Section
- Search + Filter Bar

MVP 이후 확장 Block 후보:
- Data Table Section
- Login Form
- Settings Section
- Empty State
- Form Section

MVP Layout Preset:
- Blank
- Sidebar + Main
- Header + Content

사용자는 Block 전체를 Canvas에 삽입할 수 있다.

향후 My Block 저장을 지원한다.

---

## 14. 편집 기능

### MVP 필수
- Drag & Drop
- Grid Snap Resize
- Select
- Duplicate
- Delete
- Undo
- Redo
- Lock
- Structure Tree
- Grid Show / Hide

### MVP 이후
- Multi-select
- Align
- Distribute
- Copy / Paste Style
- Command Palette
- Keyboard Shortcut 확장
- Component Search
- Batch Property Edit
- Alignment Guide

---

## 15. Responsive

Breakpoint:
- Desktop
- Tablet
- Mobile

기본 동작:
- Desktop 설정을 기반으로 Tablet / Mobile 자동 변환
- Grid Span 자동 조절
- Stack 필요 시 자동 세로 배치

사용자는 각 Breakpoint에서 Override할 수 있다.

Responsive Override 예:
- Width
- Display
- Direction
- Gap
- Padding
- Alignment

---

## 16. Design Lint

**MVP 이후 기능이다.**

초기에는 Rule-based 방식으로 구현한다.

검사 후보:
- Design Token 미사용 Spacing
- 동일 그룹 내 불일치 Gap
- Button 높이 불일치
- Grid 정렬 불일치
- Text Contrast 부족
- 너무 작은 Body Text
- 과도한 Radius 혼용
- Section 간격 불균형
- Responsive Overflow

Lint는 Warning 중심으로 제공하고 사용자의 편집을 막지 않는다.

---

## 17. Preview

Canvas와 Preview를 분리한다.

Preview Mode에서는 편집 보조 요소를 제거한다.

제거:
- Grid
- Selection Border
- Resize Handle
- Guide

MVP Preview:
- 실제 스타일 렌더링
- Desktop / Tablet / Mobile 확인
- Hover / Focus 같은 기본 CSS State 확인

v1 이후 Interaction Preview:
- Tabs
- Dropdown
- Modal
- Toggle

복잡한 Prototype Flow는 범위에서 제외한다.

---

## 18. 저장

### 18.1 기본 저장
IndexedDB를 사용한다.

MVP 저장 대상:
- Projects
- Project Theme / Style 설정
- Grid / Responsive / Component 상태

Undo / Redo History는 MVP에서 Runtime Memory에만 유지하며 브라우저 재시작 후 복원하지 않는다.

MVP 이후 저장 대상:
- My Preset
- My Components
- My Blocks
- Version Snapshot

### 18.2 Backup
JSON Export / Import를 지원한다.

### 18.3 Auto Save
편집 시 자동 저장한다.

---

## 19. JSON Schema

모든 프로젝트의 원본 상태를 JSON으로 저장한다.

개념 예시:

```json
{
  "schemaVersion": 1,
  "project": {
    "id": "project-1",
    "name": "Dashboard"
  },
  "theme": "default-light",
  "style": "clean",
  "grid": {
    "desktop": {
      "columns": 12,
      "gutter": 24,
      "margin": 32
    }
  },
  "rootId": "page-1",
  "nodes": {
    "page-1": {
      "id": "page-1",
      "type": "page",
      "children": ["card-1"]
    },
    "card-1": {
      "id": "card-1",
      "type": "card",
      "children": [],
      "layout": {
        "desktop": {
          "span": 4
        }
      },
      "style": {
        "padding": "lg",
        "radius": "md"
      }
    }
  }
}
```

MVP는 `rootId + nodes Record + children: string[]` 구조를 기본 방향으로 한다.
`parentId`는 영구 저장하지 않고 필요 시 Runtime Index에서 계산한다.

Schema Version을 포함해 향후 Migration이 가능하도록 한다.

---

## 20. Export

### 20.1 MVP Export
- Project JSON
- React Component
- Tailwind CSS 기반 Class

### 20.2 코드 Export 원칙
- 읽을 수 있는 코드
- 불필요한 Absolute Position 최소화
- Grid / Flex 의미 유지
- Component 계층 유지
- 반복되는 부분은 Component화 가능
- Design Token은 Tailwind Config 또는 CSS Variable로 표현 가능

### 20.3 초기 지원 대상
React + Tailwind CSS만 지원한다.

Export는 **one-way 생성**이다.
생성된 코드를 다시 UI Composer로 Import하거나 양방향 동기화하지 않는다.

MVP Export는 UI 구조와 Styling을 중심으로 생성한다.
API 호출, 상태관리, 데이터 Binding, Business Logic, 실제 Form Submit 동작은 생성하지 않는다.

HTML, Vue, Svelte 등은 초기 범위에서 제외한다.

---

## 21. 기술 방향

초기 기술 방향:
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand 또는 동급 State Management
- IndexedDB
- **Puck을 Editor Framework 1순위로 채택**

Puck의 역할:
- Visual Editor 기본 구조
- Component Registry
- Drag & Drop
- Component 선택 및 편집
- 기본 Editor State 관리

앱이 직접 소유할 영역:
- Project JSON Schema
- 12-column Grid System
- Grid Snap Resize
- Design Token
- Theme / Style
- Responsive Rule
- Block System
- React + Tailwind Export

Puck 내부 데이터 모델을 Project의 영구 저장 포맷으로 사용하지 않는다.
Project JSON Schema는 앱 자체가 소유하며, Puck은 Editor Layer로만 사용한다.

Fallback:
Puck이 Grid 기반 편집, Nested Layout, Responsive Override, Custom Properties Panel 등의 핵심 UX를 구조적으로 제한할 경우에만 dnd-kit 기반 Custom Editor로 전환한다.

배포:
- GitHub Pages

추가 서버는 사용하지 않는다.

## 21.1 Icon / Asset 정책

MVP에서는 복잡한 Asset Manager를 만들지 않는다.

아이콘은 오픈소스 Icon Library 하나를 기본으로 채택하는 방향을 우선 검토한다.

원칙:
- Icon Button, Navigation 등에 동일 Icon Set 사용
- SVG 직접 편집 기능 없음
- 사용자가 별도 이미지를 편집하는 기능 없음
- 향후 Custom Icon 등록은 별도 기능으로 검토

---

## 22. Non-Goals

초기 제품에서는 다음을 만들지 않는다.

- AI UI Generation
- AI Agent
- Prompt-to-UI
- 협업
- 실시간 공동 편집
- 로그인
- 서버 Database
- 자유 Drawing
- Pen Tool
- Vector 편집
- 이미지 편집
- Animation Timeline
- 복잡한 Prototype Flow
- Figma Import
- Design-to-Code 완전 자동 변환
- 여러 Framework 동시 Export
- API / Database 연결
- 외부 Data Source Binding
- Business Logic 자동 생성
- Export한 코드의 재Import / 양방향 동기화

---

## 23. MVP 범위

### 포함
- Project 생성 / 저장
- Component Library
- 기본 Block Library 최소 4종(Sidebar Navigation, Page Header, KPI Section, Search + Filter)
- Canvas
- Drag & Drop
- 12-column 기반 Grid
- Grid 설정 변경
- Grid Snap Resize
- Flex / Grid 내부 Layout
- Properties Panel
- Theme
- 기본 Style
- Spacing Token
- Typography Token
- Desktop / Tablet / Mobile
- Undo / Redo
- Duplicate / Delete
- Structure Tree
- Preview
- IndexedDB Auto Save
- JSON Import / Export
- React + Tailwind Export

### MVP 이후
- Design Lint 초기 도입 및 고도화
- My Component
- My Block
- Preset 고도화
- Copy / Paste Style
- Command Palette
- Advanced Interaction
- Template Library

---

## 24. 성공 기준

MVP 성공 기준:
1. 사용자가 빈 프로젝트에서 Dashboard 형태의 화면을 10분 내 구성할 수 있다.
2. Grid 및 Token을 사용해 UI 일관성을 유지할 수 있다.
3. 브라우저를 닫았다 열어도 프로젝트가 유지된다.
4. JSON으로 프로젝트를 Export / Import할 수 있다.
5. React + Tailwind CSS 코드로 Export할 수 있다.
6. Export된 코드를 실제 Vibe Coding 프로젝트의 시작점으로 사용할 수 있다.
7. GitHub Pages에서 서버 없이 동작한다.

---

## 25. 추후 검토 사항
- IndexedDB Wrapper 사용 여부
- Tailwind Export 방식
- Custom Font 등록 방식
- My Component 저장 방식
- Schema Migration 정책 상세
- Responsive 자동 변환 Rule 상세
- Design Lint Rule 정의
- Code Export 패키징 방식(zip / file bundle)
- Project JSON Schema 세부 명세

---
