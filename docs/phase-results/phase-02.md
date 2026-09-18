# Phase 2 Result

Date: 2026-09-18
Status: PASS

## Implemented

- Project JSON v1에 `schemaVersion`, project metadata, breakpoint별 Grid, Theme/Style reference를 추가했다.
- Node Tree를 `rootId + nodes + children[]`로 정규화하고 parentId를 저장하지 않는다.
- Puck 전용 변환 코드를 `puck-adapter.ts`로 분리해 앱 Schema가 Puck 타입에 의존하지 않도록 했다.
- `ProjectRenderer`를 추가해 Puck 없이 Project JSON만으로 Page, Section, Container, Flex, Grid, Card, Text, Button, Input을 렌더링한다.
- Desktop / Tablet / Mobile Grid와 Node별 Responsive span을 Renderer에 적용했다.
- 알 수 없는 Node Type과 순환 참조를 crash 없이 placeholder로 표시한다.
- Phase 0에서 저장된 localStorage Puck Data도 Project JSON v1로 읽을 수 있게 호환 경로를 추가했다.
- `SCHEMA_SPEC.md`에 저장 포맷과 Renderer 경계를 기록했다.
- Editor 상단에서 독립 Schema Renderer를 열어 Puck 결과와 비교할 수 있게 했다.

## Tests

- Passed: TypeScript `tsc --noEmit`
- Passed: Vite production build
- Passed: Schema serialize/deserialize smoke test (schemaVersion, nested children, tablet grid, mobile span)
- Passed: GitHub Pages deployment workflow
- Passed: 배포 사이트에서 Editor Shell과 독립 Renderer UI 확인

## Known Issues

- Puck 의존성으로 production bundle 일부가 500KB를 초과한다는 Vite 경고가 있다.
- Puck Editor에서 아직 Input을 Left Panel에 등록하지 않았다. Phase 3 Component Registry에서 추가한다.

## Deferred

- Component Registry
- 앱 소유 Drag & Drop
- Resize
- IndexedDB
- Theme Token 편집 UI

## Technical Decisions

- Project Schema와 Renderer는 Puck을 import하지 않는다.
- Puck과 Schema 사이의 변환 책임은 Editor 전용 Adapter에 둔다.
- Renderer는 알 수 없는 타입을 placeholder로 표시해 전체 화면을 중단하지 않는다.

## Next Phase

Phase 3 — Component Registry
