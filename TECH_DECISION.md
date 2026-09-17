# TECH_DECISION — Editor Engine Architecture

## 1. 문서 목적

이 문서는 Vibe Coding UI Composer의 Editor Engine 선택과 관련된 기술 결정을 기록한다.

현재 결정은 **Puck을 Editor Framework 1순위로 채택**하는 것이다.

단, Puck의 내부 구조에 프로젝트 전체를 종속시키지 않으며, 핵심 요구사항을 구조적으로 방해할 경우 **dnd-kit 기반 Custom Editor로 전환**할 수 있도록 설계한다.

---

## 2. 결정 요약

### 선택
- 1순위 Editor Framework: **Puck**
- Fallback: **dnd-kit 기반 Custom Editor**

### 핵심 원칙
- Puck은 Editor Layer로만 사용한다.
- Project JSON Schema는 앱이 직접 소유한다.
- Puck 내부 데이터 모델을 영구 저장 포맷으로 사용하지 않는다.
- Puck과 Project Schema 사이에 Adapter Layer를 둔다.
- Grid, Design Token, Responsive, Export는 앱 자체 기능으로 구현한다.

---

## 3. 선택 배경

이 프로젝트의 목적은 Drag & Drop Editor 자체를 만드는 것이 아니다.

핵심 가치는 다음 영역에 있다.

- Grid 기반 UI 조립
- Grid Snap Resize
- Design Token
- Theme / Style
- Responsive Layout
- Component / Block 재사용
- React + Tailwind CSS Export
- Local-first 프로젝트 저장

따라서 Drag & Drop, Component Registry, Selection, 기본 Editor State 같은 범용 Editor 기능을 처음부터 직접 구현하는 것은 초기 개발 범위를 불필요하게 키운다.

Puck을 활용해 기본 Editor 기능을 확보하고, 프로젝트 고유 기능에 집중하는 방향을 우선한다.

---

## 4. Puck을 선택한 이유

### 4.1 React Component 기반

이 프로젝트의 최종 Export 대상이 React + Tailwind CSS이므로 React Component 중심 Editor 구조와 궁합이 좋다.

### 4.2 Visual Editor 기본 기능 활용 가능

다음과 같은 기본 기능을 직접 처음부터 만들 필요를 줄일 수 있다.

- Component Registry
- Drag & Drop
- Component 선택
- 기본 편집 흐름
- Properties 기반 Component 설정
- Serializable Editor State

### 4.3 개발 범위 축소

dnd-kit만 사용할 경우 아래 기능 대부분을 직접 설계해야 한다.

- Node Tree
- Nested Drop
- Selection
- Drop Indicator
- Component Registry
- Property Binding
- Reordering
- Editor State
- Undo / Redo 연계
- Drag Validation

Puck을 사용하면 이 중 상당 부분을 기반 기능으로 활용할 수 있다.

### 4.4 프로젝트 핵심 기능에 집중 가능

절약된 개발 범위를 다음 기능에 집중할 수 있다.

- 12-column Grid
- Responsive Grid
- Grid Snap Resize
- Spacing / Typography Token
- Theme / Style
- Component Constraint
- Block System
- React + Tailwind Export

---

## 5. Puck이 담당하는 영역

Puck은 다음 기능의 기반으로 사용한다.

### Editor UI
- Canvas 기반 편집
- Component 선택
- Component 추가
- Component 이동
- Component 순서 변경

### Component Registry
- Component Type 등록
- 기본 Props 정의
- Editor에 노출할 Component 정의

### 기본 편집 기능
- Drag & Drop
- Nested Component 편집
- Field / Property 편집 연결

Puck의 기본 기능을 그대로 사용하는 것이 아니라 필요한 경우 Custom UI로 감싸서 사용한다.

---

## 6. 앱이 직접 소유하는 영역

다음 영역은 Puck에 맡기지 않는다.

### Project JSON Schema

프로젝트의 영구 데이터 모델은 앱이 직접 정의한다.

예:

```json
{
  "schemaVersion": 1,
  "project": {
    "id": "project-1",
    "name": "Dashboard"
  },
  "grid": {
    "desktop": {
      "columns": 12,
      "gutter": 24,
      "margin": 32
    }
  },
  "nodes": []
}
```

### Grid System
- Column 수
- Gutter
- Outer Margin
- Breakpoint별 Grid
- Grid Overlay

### Grid Snap Resize
- Column 단위 Width Resize
- Min / Max Span
- Breakpoint별 Span

### Design Token
- Spacing
- Radius
- Shadow
- Typography
- Color

### Theme / Style
- Theme
- Style
- Preset
- Component Override

### Responsive
- Desktop
- Tablet
- Mobile
- Breakpoint Override
- Auto Stack Rule

### Block
- 여러 Component를 묶은 재사용 JSON Fragment

### Persistence
- IndexedDB
- JSON Import / Export

### Code Export
- React
- Tailwind CSS
- Token / CSS Variable Export

---

## 7. Adapter Layer

Puck의 데이터 구조와 Project JSON Schema 사이에 Adapter Layer를 둔다.

```text
Project JSON
    ↓
Editor Adapter
    ↓
Puck Editor State
    ↓
Puck Canvas
```

편집 결과는 반대 방향으로 다시 Project JSON에 반영한다.

```text
Puck Change
    ↓
Editor Adapter
    ↓
Project JSON Update
    ↓
IndexedDB
```

이 구조의 목적은 Editor Framework 교체 가능성을 유지하는 것이다.

---

## 8. 금지 사항

다음 구조는 사용하지 않는다.

```text
Puck State
   ↓
그대로 IndexedDB 저장
   ↓
Project Format
```

이렇게 구현하면 Puck이 Project Schema 자체가 되어 향후 Editor Engine 교체가 매우 어려워진다.

따라서 Puck State는 Runtime Editor State로 취급한다.

---

## 9. Puck PoC 검증 항목

본 구현 전에 작은 PoC를 만든다.

### 반드시 검증할 기능

#### 1. Component Registry
- Custom Component 등록 가능
- Category 분류 가능
- 기본 Props 정의 가능

#### 2. Nested Layout
아래 구조가 자연스럽게 동작해야 한다.

```text
Page
└ Section
   └ Grid
      └ Card
         ├ Text
         └ Button
```

#### 3. Custom Properties Panel
선택된 Node에 대해 다음 UI를 구현할 수 있어야 한다.

- Layout
- Grid Span
- Spacing
- Typography
- Appearance
- Responsive

#### 4. Grid Resize 확장
Card 등의 Component를 Resize할 때 px 값이 아니라 Grid Column Span으로 변환할 수 있어야 한다.

예:

```text
4 / 12
↓ Drag
5 / 12
↓ Drag
6 / 12
```

#### 5. Responsive State
동일 Node에 대해 Breakpoint별 속성을 관리할 수 있어야 한다.

```json
{
  "desktop": {
    "span": 4
  },
  "tablet": {
    "span": 4
  },
  "mobile": {
    "span": 4
  }
}
```

#### 6. External State Sync
Puck 변경 내용을 앱의 Project JSON에 안정적으로 반영할 수 있어야 한다.

#### 7. Editor UI Customization
프로젝트 전용 Left Panel / Right Panel / Top Bar를 구성할 수 있어야 한다.

#### 8. GitHub Pages
정적 빌드 후 GitHub Pages에서 정상 실행되어야 한다.

---

## 10. Puck 유지 조건

다음 조건을 만족하면 Puck을 계속 사용한다.

- Nested Component 구조가 안정적이다.
- Project JSON과 Editor State를 분리할 수 있다.
- Custom Properties Panel 구현이 가능하다.
- Grid 기반 Resize를 외부 로직으로 구현할 수 있다.
- Responsive Override 상태를 관리할 수 있다.
- Editor UI를 프로젝트 목적에 맞게 충분히 수정할 수 있다.
- Puck을 우회하기 위한 복잡한 Hack이 필요하지 않다.

---

## 11. dnd-kit 전환 조건

다음 중 하나 이상이 핵심 기능을 심각하게 제한할 경우 dnd-kit 기반 Custom Editor 전환을 검토한다.

### Grid Resize 제한
Grid Column 기반 Resize를 자연스럽게 구현할 수 없다.

### Nested Layout 제한
Flex / Grid / Container 중첩을 원하는 방식으로 제어하기 어렵다.

### Responsive 제한
Breakpoint별 Layout State를 안정적으로 관리하기 어렵다.

### Properties Panel 제한
Custom Properties UI가 Puck 구조에 지나치게 종속된다.

### State 분리 문제
Puck State와 Project JSON을 분리하는 데 과도한 변환이나 동기화 문제가 발생한다.

### UX 제한
프로젝트에서 원하는 Canvas UX를 만들기 위해 Puck 내부 동작을 계속 우회해야 한다.

### 유지보수 위험
필요한 기능이 비공개 API 또는 불안정한 내부 API에 의존하게 된다.

---

## 12. dnd-kit 전환 시 구조

Fallback이 발생하더라도 Project JSON은 변경하지 않는다.

```text
현재

Project JSON
    ↓
Puck Adapter
    ↓
Puck

Fallback 이후

Project JSON
    ↓
Custom Editor Adapter
    ↓
dnd-kit
```

Project Schema와 Renderer가 Editor Engine과 독립적이어야 하는 이유다.

---

## 13. Craft.js 판단

Craft.js도 후보가 될 수 있지만 현재 우선순위에서는 제외한다.

이유:
- Puck보다 Editor UI 구현 범위가 커질 가능성이 높다.
- dnd-kit보다 높은 수준이지만 원하는 구조에 맞추려면 추가 커스터마이징이 필요하다.
- 현재는 Puck → dnd-kit의 2단계 선택 구조가 더 단순하다.

향후 Puck은 부족하고 dnd-kit 직접 구현 비용이 너무 높다고 판단될 경우 재검토할 수 있다.

---

## 14. Architecture Boundary

권장 구조:

```text
src/
├ app/
├ editor/
│  ├ puck/
│  │  ├ adapter/
│  │  ├ components/
│  │  └ config/
│  └ shared/
├ schema/
│  ├ project/
│  ├ node/
│  └ migrations/
├ components/
│  ├ basic/
│  └ blocks/
├ design-system/
│  ├ tokens/
│  ├ themes/
│  └ styles/
├ renderer/
├ persistence/
├ responsive/
└ export/
```

핵심은 `schema`, `renderer`, `export`, `design-system`이 `editor/puck`에 의존하지 않는 것이다.

가능한 의존 방향:

```text
Puck Adapter
     ↓
Project Schema
     ↑
Renderer
     ↑
Exporter
```

피해야 할 방향:

```text
Project Schema
     ↓
Puck 내부 Type
```

---

## 15. 구현 순서

### Step 1
React + TypeScript + Vite 프로젝트 생성

### Step 2
Puck 최소 Editor 구성

### Step 3
PoC용 최소 Project JSON Schema 작성

이 Schema는 Editor 적합성 검증을 위한 Spike 수준이며,
정식 Schema는 Phase 2에서 확정한다.

### Step 4
Puck ↔ Project JSON Adapter PoC

### Step 5
Nested Component 테스트

### Step 6
Custom Properties Panel 테스트

### Step 7
12-column Grid Overlay 구현

### Step 8
Grid Snap Resize PoC

### Step 9
Responsive Override PoC

### Step 10
Puck 적합성 최종 판단

이 단계까지 통과하면 Puck을 정식 Editor Engine으로 확정한다.

---

## 16. 최종 결정

현재 결정:

> Puck을 Editor Framework 1순위로 사용한다.

단 다음 원칙을 유지한다.

> Puck은 UI Composer의 Editor Engine일 뿐, UI Composer 자체의 데이터 모델이 아니다.

Project JSON Schema, Renderer, Design System, Responsive Engine, Persistence, Exporter는 Puck과 독립적으로 설계한다.

Puck이 핵심 Grid / Responsive / Editor UX 요구사항을 구조적으로 막는 경우에만 dnd-kit 기반 Custom Editor로 전환한다.

---

## 17. 결정 상태

- Status: **Accepted — PoC Validation Required**
- Primary: **Puck**
- Fallback: **dnd-kit**
- Project Schema Ownership: **Application**
- AI Features: **Not Included**
