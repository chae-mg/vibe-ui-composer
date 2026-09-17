# WIREFRAME — Editor Shell

## 목적

Phase 1에서 검증할 Editor 기본 배치와 패널 역할을 정의한다. 현재 구현은 Puck의 기본 Shell을 사용하고, 앱의 Project Schema와 시각적 확장은 이후 Phase에서 추가한다.

## 기본 화면

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Top Bar: 프로젝트명 · 경로 · Preview · Publish                      │
├───────────────┬──────────────────────────────────┬───────────────────┤
│ Left Panel    │ Canvas                           │ Right Panel       │
│               │                                  │                   │
│ Components    │ 선택된 화면을 편집하는 영역       │ Properties        │
│ Blocks        │ Responsive viewport              │ 선택 Node의 필드   │
│ Structure     │                                  │                   │
│ (Outline)     │                                  │                   │
└───────────────┴──────────────────────────────────┴───────────────────┘
```

## 영역별 역할

- Top Bar: 앱 제목, 현재 경로, Preview/Publish 진입점을 표시한다.
- Left Panel: Component 목록과 Structure(Outline)를 제공한다. 패널은 접었다 펼 수 있다.
- Canvas: Puck이 렌더링하는 편집 화면이다. Mobile 390px, Tablet 768px, Desktop 1440px viewport를 제공한다.
- Right Panel: 선택된 Component의 Properties를 표시한다. 선택 전에는 안내 상태를 표시한다.

## 반응형 기준

- Desktop: 1024px 이상
- Tablet: 768–1023px
- Mobile: 0–767px
- Editor Shell은 브라우저 폭이 줄어도 Canvas가 패널 아래로 겹치지 않도록 패널을 접을 수 있어야 한다.

## Phase 1 상태

- 패널과 기본 크기: Puck 기본 Shell 사용
- Panel Resize: Puck 기본 동작 사용
- 데이터 모델: Phase 0 PoC의 Puck Data 유지
- 저장/Export/Grid/Theme: 이후 Phase에서 구현
