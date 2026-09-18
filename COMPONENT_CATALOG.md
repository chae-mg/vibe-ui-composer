# COMPONENT_CATALOG — Registry v1

## 목적

Component Registry는 Left Panel, Project Renderer, Child Constraint, 기본 Props와 Properties Schema가 공유하는 단일 메타데이터 목록이다.

각 항목은 다음 정보를 가진다.

- `type`, `label`, `icon`, `category`
- `defaultProps`, `defaultStyle`, `variants`
- `allowedChildren`, `canHaveChildren`
- `resizeRules` (`minSpan`, `maxSpan`, `snap`)
- `propertySchema`

## 등록 컴포넌트

| Type | Category | Children | 주요 Props |
| --- | --- | --- | --- |
| Page | layout | 가능 | title |
| Section | layout | 가능 | title, tone, content |
| Container | layout | 가능 | content |
| Flex | layout | 가능 | direction, gap, content |
| Grid | layout | 가능 | columns, gap, content |
| Card | layout | 가능 | title, body, span, responsive span |
| Heading | content | 불가 | text, level |
| Text | content | 불가 | text |
| Button | content | 불가 | label, variant |
| Input | form | 불가 | label, placeholder, inputType |
| Select | form | 불가 | label, options |
| Badge | display | 불가 | text, tone |
| Divider | display | 불가 | orientation |
| Table | display | 불가 | title, columns |

## 사용 경계

```text
Component Registry
 ├─ Puck component config / Left Panel
 ├─ ProjectRenderer node lookup
 └─ allowedChildren / defaultProps / property schema
```

Puck의 내부 데이터 타입은 Registry의 영구 Schema에 저장하지 않는다. Registry는 앱 전용 `ComponentType`을 사용하고 Puck 이름 변환은 `puck-adapter.ts`에 둔다.
