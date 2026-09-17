# Vibe Coding UI Composer

Grid와 Design Token 제약 안에서 웹앱 UI를 시각적으로 조립하고, React + Tailwind CSS 코드로 내보내는 개인용 Visual UI Composer입니다.

## 목표

- Vibe Coding 전에 UI 구조를 시각적으로 확정
- Component와 Block을 Grid 기반으로 빠르게 조립
- Theme, Style, Spacing, Typography Token으로 일관된 UI 구성
- 완성된 화면을 React + Tailwind CSS 코드로 Export
- 서버 없이 GitHub Pages와 브라우저 로컬 저장으로 사용

AI UI 생성, Prompt-to-UI, 협업, 로그인, 서버 데이터베이스 연결은 초기 범위에 포함하지 않습니다.

## MVP 범위

- Component Library와 기본 Block Library
- Canvas Drag & Drop
- 12-column Responsive Grid와 Grid Snap Resize
- Flex / Grid 내부 Layout
- Properties Panel
- Theme, Style, Spacing, Typography Token
- Desktop / Tablet / Mobile 편집과 Preview
- Undo / Redo, Duplicate, Delete, Structure Tree
- IndexedDB 자동 저장
- JSON Import / Export
- React + Tailwind CSS Export

기본 제공 Block은 Sidebar Navigation, Page Header, KPI Section, Search + Filter이며, Layout Preset은 Blank, Sidebar + Main, Header + Content를 제공합니다.

## 기술 방향

- React + TypeScript + Vite
- Tailwind CSS
- Zustand 또는 동급 상태 관리
- IndexedDB
- Puck을 Editor Framework 1순위로 검토
- Project JSON Schema는 Editor Framework와 분리

## 구현 순서

개발은 Phase 단위로 진행합니다.

1. Phase 구현
2. 해당 Phase 테스트
3. 통과 시 다음 Phase로 이동
4. 결과를 Phase 기록에 남김

자세한 요구사항과 구현 기준은 다음 문서를 참고하세요.

- [PRD](./PRD.md)
- [PLAN](./PLAN.md)
- [TECH_DECISION](./TECH_DECISION.md)
- [PHASE_GUIDE](./PHASE_GUIDE.md)
- [TEST_CHECKLIST](./TEST_CHECKLIST.md)

## 현재 상태

Phase 0 Puck Editor PoC를 `apps/puck-poc`에 추가했습니다. Component Registry, Drag & Drop, Properties Panel, viewport 전환, localStorage JSON 저장 흐름을 확인할 수 있습니다. 실행 방법은 [PoC README](./apps/puck-poc/README.md)를 참고하세요.
