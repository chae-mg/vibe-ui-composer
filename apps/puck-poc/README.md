# Puck PoC

Phase 0 검증을 위한 최소 Puck 앱입니다.

## 검증 범위

- Puck Component Registry
- Component Drag & Drop
- 선택 및 Properties Panel 편집
- onChange / onPublish 데이터 흐름
- 브라우저 localStorage 기반 임시 JSON 저장
- Mobile / Tablet / Desktop viewport

## 실행

Node.js가 설치된 환경에서:

    npm install
    npm run dev

Production build:

    npm run build

이 PoC의 목적은 최종 Editor UX를 구현하는 것이 아니라, Puck을 프로젝트의 기본 Editor Layer로 사용할 수 있는지 검증하는 것입니다.
