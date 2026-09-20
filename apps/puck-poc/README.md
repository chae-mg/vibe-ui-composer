# Puck PoC

Phase 0~7 검증을 위한 Registry 기반 Puck Editor와 독립 Project Renderer 앱입니다.

## 검증 범위

- Puck Component Registry
- Page > Section > Grid > Card 중첩 슬롯
- Component Drag & Drop
- 선택 및 Properties Panel 편집
- 12-column Grid Overlay와 Card span
- Desktop / Tablet / Mobile span 값 저장 및 CSS 적용
- Puck Data ↔ 앱 소유 Project Schema Adapter
- onChange / onPublish 데이터 흐름
- 브라우저 localStorage 기반 Puck Data + Project JSON 저장
- Mobile / Tablet / Desktop viewport
- Puck과 분리된 Project JSON v1 Renderer
- 14개 Component Registry와 Child Constraint metadata
- Registry Child Constraint에서 자동으로 계산되는 Nested Slot 허용 목록
- Canvas 상호작용을 위한 Duplicate / Delete / Reorder Project Tree 연산
- Desktop 4 / 6 / 8 / 12 / 16-column Grid Preset
- Gutter / Outer Margin 설정과 Grid Overlay 토글
- Component Grid Span의 Column Snap 및 Registry Min / Max clamp
- Container를 Stack으로 사용하는 Column Layout
- Flex Row / Column, Wrap, Align, Justify, Gap, Padding, Height Mode
- CSS Grid Columns, Align, Justify, Gap, Padding, Height Mode
- Puck Canvas와 독립 Renderer가 공유하는 Layout Style 변환
- 선택 Component를 위한 Layout / Size / Spacing / Typography / Appearance / Props 탭
- Registry propertySchema에서 생성되는 Properties Panel 필드
- Properties 변경 시 Puck Data와 Project JSON 자동 저장
- 알 수 없는 Node Type의 안전한 placeholder 처리

## 실행

Node.js가 설치된 환경에서:

    npm install
    npm run dev

Production build:

    npm run build

상단의 **Open schema renderer**를 누르면 현재 Project JSON을 Puck 없이 렌더링하는 독립 Renderer를 확인할 수 있습니다. Renderer의 기준 문서는 저장소 루트의 `SCHEMA_SPEC.md`입니다.
