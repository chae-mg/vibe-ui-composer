# Puck PoC

Phase 0 검증을 위한 최소 Puck 앱입니다.

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

## 실행

Node.js가 설치된 환경에서:

    npm install
    npm run dev

Production build:

    npm run build

이 PoC의 목적은 최종 Editor UX를 구현하는 것이 아니라, Puck을 프로젝트의 기본 Editor Layer로 사용할 수 있는지 검증하는 것입니다.
