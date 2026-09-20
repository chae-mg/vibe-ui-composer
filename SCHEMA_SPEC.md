# SCHEMA_SPEC — Project JSON v1

## 목적

Project JSON은 UI Composer가 소유하는 영구 데이터 모델이다. Puck은 편집기 어댑터로만 사용하며, 이 문서의 구조에는 Puck 전용 타입을 저장하지 않는다.

## 최상위 구조

```json
{
  "schemaVersion": 1,
  "id": "puck-poc-project",
  "name": "Vibe Coding UI Composer",
  "createdAt": "2026-09-18T00:00:00.000Z",
  "updatedAt": "2026-09-18T00:00:00.000Z",
  "rootId": "project-root",
  "grid": {
    "desktop": { "columns": 12, "gutter": 24, "margin": 32 },
    "tablet": { "columns": 8, "gutter": 20, "margin": 24 },
    "mobile": { "columns": 4, "gutter": 16, "margin": 16 }
  },
  "theme": "clean-light",
  "style": "clean",
  "nodes": {}
}
```

`nodes`는 ID를 키로 사용하는 정규화된 Map이다. Parent는 저장하지 않고 각 Node의 `children: string[]`으로 트리를 표현한다. Parent Lookup이 필요하면 Runtime에 계산한다.

`theme`는 전역 색상 팔레트 ID이며 현재 `clean-light`와 `clean-dark`를 지원한다. `style`은 전역 모서리, 그림자, 밀도, 표면 투명도, 글꼴 조합이며 현재 `clean`, `soft`, `business`, `compact`, `glass`를 지원한다. 내장 Preset은 이 두 필드를 함께 갱신한다. Puck Canvas와 독립 Renderer는 같은 CSS variable resolver로 전역 값을 계산한다.

Block은 저장 시 별도 특수 타입으로 남기지 않고, 삽입 시 일반 Project Node Fragment로 펼친다. Fragment의 모든 Node ID는 현재 Project의 ID 집합과 비교해 새로 생성하며, 삽입된 Node는 기존 Component와 같은 Properties / Renderer 경로를 사용한다. Layout Preset은 Project root의 `children`과 `nodes`를 새 초기 구조로 교체한다.

Layout 컴포넌트의 편집 속성은 각 Node의 `props`에 저장한다. `Container`는 기본적으로 Column Stack이며, `Flex`는 Row / Column과 Wrap, Align, Justify, Gap, Padding, Height Mode를 지원한다. `Grid`는 Columns와 Gap, Align, Justify, Padding, Height Mode를 지원한다. Gap / Padding은 `space.*`, Radius는 `radius.*`, Shadow는 `shadow.*`, 텍스트 스타일은 `typographyRole` token을 우선 사용한다. Section과 Card의 기본 색상은 `theme.surface`, `theme.text`, `theme.border` alias로 저장하고, 사용자가 직접 입력한 raw 색상 값은 Component override로 유지한다. 기존 숫자형 Gap / Padding / Radius와 raw Shadow 값도 resolver가 읽어 기존 저장 JSON을 호환한다. Section과 Card는 Background, Text Color, Border, Radius, Shadow, Typography Role 속성을 지원한다. Puck 편집기와 독립 Renderer는 동일한 속성으로 스타일을 계산한다.

Responsive는 `grid.desktop`, `grid.tablet`, `grid.mobile`을 각각 보존한다. Desktop Grid 설정은 기본값이며 Tablet / Mobile은 해당 breakpoint의 Preview와 Renderer에 적용된다. Card의 `layout.gridSpan`은 Desktop 기본값이고 `responsive.tablet.gridSpan`과 `responsive.mobile.gridSpan`이 있을 때만 해당 breakpoint에서 override한다. Override가 없으면 Desktop 값을 상속하고, 현재 breakpoint의 Grid columns보다 큰 span은 Renderer에서 columns 범위로 clamp해 Mobile Auto Stack을 만든다. Puck 어댑터는 편집기 표시용 `tabletSpan`, `smallSpan` 값을 이 구조로 변환하며, 기존 저장 데이터의 `mobileSpan`은 로드 시 `smallSpan`으로 마이그레이션한다.

## Node

각 Node는 다음 필드를 가진다.

```json
{
  "id": "card-1",
  "type": "Card",
  "children": [],
  "props": { "title": "Revenue", "body": "$128,430" },
  "layout": { "gridSpan": 6 },
  "responsive": {
    "tablet": { "gridSpan": 6 },
    "mobile": { "gridSpan": 4 }
  }
}
```

초기 Renderer가 인식하는 타입은 `Page`, `Section`, `Container`, `Flex`, `Grid`, `Card`, `Text`, `Button`, `Input`이다. 알 수 없는 타입은 오류를 던지지 않고 경고 placeholder로 표시하며, 해당 Node의 자식은 계속 탐색한다.

## Renderer 경계

```text
Project JSON → ProjectRenderer → React DOM
       ↕
  Puck Adapter (Editor 전용)
```

Renderer는 Puck 패키지를 import하지 않는다. 따라서 편집기를 교체해도 JSON과 독립 Renderer는 유지할 수 있다.
