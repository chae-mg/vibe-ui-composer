# Phase 4 Result

Date: 2026-09-18
Status: PARTIAL

## Implemented

- Puck 기본 Canvas Drag & Drop, Canvas 내부 Reorder, Selection, Delete, Duplicate 흐름을 사용할 수 있도록 Editor 설정을 Phase 4 상태로 전환했다.
- Registry의 `allowedChildren`에서 Puck Slot `allow` 목록을 계산해 Section, Container, Flex, Grid, Card의 Nested Drop 제약을 한 곳에서 관리한다.
- Card가 Text, Button, Badge, Divider를 자식으로 가질 수 있도록 Nested Slot을 추가했다.
- Project JSON 트리에 대해 `duplicateSubtree`, `removeSubtree`, `reorderChildren`, `validateProjectTree` 연산을 추가했다.
- Container / Flex를 Puck ↔ Project Schema Adapter에 연결해 Registry Component가 저장 후에도 타입을 잃지 않게 했다.

## Tests

- Passed: TypeScript `tsc --noEmit`
- Passed: Vite production build
- Passed: Project operations smoke test (duplicate, delete, reorder, child constraint, tree validation)
- Pending: GitHub Pages deployment and deployed Phase 4 status

## Known Issues

- Puck 의존성으로 production bundle 일부가 500KB를 초과한다는 Vite 경고가 있다.
- Drop Indicator와 Selection Outline은 Puck Editor가 제공하는 기본 UI를 사용한다.
- 좁은 화면에서는 Puck의 Blocks / Outline / Fields 패널이 접힌 아이콘 상태로 표시될 수 있다.

## Deferred

- 앱 소유 Block Library
- Grid Snap Resize interaction
- Properties Panel token editing
- Undo / Redo history

## Technical Decisions

- Canvas에서의 즉시 편집 UX는 Puck에 맡기고, Project Tree 연산과 Child Constraint는 앱 소유 Schema 기준으로 분리한다.
- Slot 허용 목록은 Editor 파일에 중복으로 선언하지 않고 Component Registry에서 변환한다.
- Duplicate는 기존 ID와 충돌하지 않는 `-copy` suffix를 사용하고, Delete는 자식 subtree를 함께 제거한다.

## Next Phase

Phase 5 — Grid System
