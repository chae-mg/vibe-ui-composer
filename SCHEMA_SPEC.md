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
