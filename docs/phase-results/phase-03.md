# Phase 3 Result

Date: 2026-09-18
Status: PARTIAL

## Implemented

- 14개 초기 Component를 `component-registry.ts`의 단일 목록으로 등록했다.
- Category, defaultProps, defaultStyle, variants, allowedChildren, canHaveChildren, resizeRules, propertySchema를 정의했다.
- Puck Editor Left Panel에 Container, Flex, Input, Select, Badge, Divider, Table을 추가했다.
- ProjectRenderer가 Registry를 통해 Node Type을 확인하고 Heading, Select, Badge, Divider, Table을 렌더링한다.
- 알 수 없는 Type은 Registry 조회 실패로 안전한 placeholder를 표시한다.
- `COMPONENT_CATALOG.md`에 등록 목록과 경계를 기록했다.

## Tests

- Passed: TypeScript `tsc --noEmit`
- Passed: Vite production build
- Passed: Registry smoke test (14 definitions, child constraints, default props)
- Passed: 기존 Phase 2 Schema smoke test
- Pending: GitHub Pages 배포 후 Left Panel 수동 확인

## Known Issues

- Puck 의존성으로 production bundle 일부가 500KB를 초과한다는 Vite 경고가 있다.
- Registry의 propertySchema는 현재 Puck field와 독립적으로 선언되어 있으며, 일부 고급 field 타입은 다음 Properties Panel Phase에서 연결한다.

## Deferred

- Component Registry 기반 자동 Properties Panel
- 앱 소유 Drag & Drop
- Resize interaction
- Block Library

## Technical Decisions

- Registry의 `ComponentType`과 Puck의 `*Block` 이름은 분리한다.
- Child constraint는 Project type 기준으로 저장하고 Puck slot allow 목록은 Adapter/Editor Layer에서 변환한다.
- Renderer는 Registry에 없는 타입을 오류로 throw하지 않는다.

## Next Phase

Phase 4 — Canvas Drag & Drop
