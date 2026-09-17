# TEST_CHECKLIST — Vibe Coding UI Composer

## 1. 문서 목적

이 문서는 각 Phase 완료 후 기존 기능이 깨지지 않았는지 반복 검증하기 위한 Regression Test Checklist다.

`PHASE_GUIDE.md`의 Phase별 테스트는 해당 기능의 상세 테스트이고,
이 문서는 프로젝트 전체의 핵심 흐름을 빠르게 점검하는 공통 체크리스트다.

---

## 2. 테스트 등급

### Smoke
매 Phase 후 실행한다.

단, **현재까지 구현 완료된 기능에 해당하는 항목만 실행**한다.
아직 구현하지 않은 Phase의 체크는 실패가 아니라 `N/A`로 처리한다.

### Regression
주요 Milestone 완료 시 현재까지 구현된 기능 전체를 실행한다.

### Release
GitHub Pages 배포 전 전체 실행한다.

---

# A. Application

## Smoke
- [ ] 앱이 정상 실행된다.
- [ ] Console Error가 없다.
- [ ] 화면이 비어 있거나 Crash하지 않는다.
- [ ] Top Bar가 표시된다.
- [ ] Left Panel이 표시된다.
- [ ] Canvas가 표시된다.
- [ ] Right Panel이 표시된다.

## Release
- [ ] Production Build가 성공한다.
- [ ] GitHub Pages에서 정상 접속된다.
- [ ] 새로고침 후 404가 발생하지 않는다.
- [ ] Asset Path가 깨지지 않는다.

---

# B. Project Schema

## Regression
- [ ] Project에 schemaVersion이 있다.
- [ ] Project JSON을 serialize할 수 있다.
- [ ] serialize → deserialize 후 동일 구조가 유지된다.
- [ ] Editor Framework 전용 Type이 Project JSON에 직접 저장되지 않는다.
- [ ] 알 수 없는 Node Type이 전체 앱을 Crash시키지 않는다.

---

# C. Component Registry

## Regression
- [ ] 기본 Component가 모두 표시된다.
- [ ] Component Category가 올바르다.
- [ ] Default Props가 적용된다.
- [ ] Variant가 정상 동작한다.
- [ ] Child Constraint가 적용된다.

---

# D. Drag & Drop

## Smoke
- [ ] Component를 Canvas에 추가할 수 있다.
- [ ] Component를 이동할 수 있다.
- [ ] Component를 삭제할 수 있다.
- [ ] Component를 복제할 수 있다.

## Regression
- [ ] Nested Container에 Drop할 수 있다.
- [ ] 금지된 위치에는 Drop되지 않는다.
- [ ] Reorder 결과가 JSON에 반영된다.
- [ ] Drop 후 Node ID가 중복되지 않는다.

---

# E. Grid

## Smoke
- [ ] Grid Overlay를 표시할 수 있다.
- [ ] Grid Overlay를 숨길 수 있다.
- [ ] Resize가 Column 단위로 Snap된다.

## Regression
- [ ] Desktop 기본값은 12 Columns다.
- [ ] Column 수 변경이 가능하다.
- [ ] Gutter 변경이 가능하다.
- [ ] Outer Margin 변경이 가능하다.
- [ ] Min Span 이하로 Resize되지 않는다.
- [ ] Max Span 이상으로 Resize되지 않는다.
- [ ] Grid 설정이 Project JSON에 저장된다.

---

# F. Layout

## Regression
- [ ] Flex Row가 동작한다.
- [ ] Flex Column이 동작한다.
- [ ] Grid Container가 동작한다.
- [ ] Align이 동작한다.
- [ ] Justify가 동작한다.
- [ ] Gap이 적용된다.
- [ ] Padding이 적용된다.
- [ ] Nested Layout이 깨지지 않는다.

---

# G. Design Token

## Regression
- [ ] Spacing Token이 정상 적용된다.
- [ ] Radius Token이 정상 적용된다.
- [ ] Shadow Token이 정상 적용된다.
- [ ] Typography Role이 정상 적용된다.
- [ ] 동일 Token은 동일한 결과를 만든다.

---

# H. Theme & Style

## Regression
- [ ] Theme 변경 시 전체 색상이 갱신된다.
- [ ] Style 변경 시 Radius/Shadow/Density가 반영된다.
- [ ] Component Override가 동작한다.
- [ ] Theme 변경 후 Layout이 깨지지 않는다.
- [ ] Style 변경 후 Text Overflow가 발생하지 않는다.

---

# I. Responsive

## Smoke
- [ ] Desktop 전환 가능
- [ ] Tablet 전환 가능
- [ ] Mobile 전환 가능

## Regression
- [ ] Breakpoint별 Grid가 올바르다.
- [ ] Tablet Override가 Desktop을 변경하지 않는다.
- [ ] Mobile Override가 Desktop을 변경하지 않는다.
- [ ] Auto Stack이 정상 동작한다.
- [ ] Component Overflow가 없다.
- [ ] Display Override가 정상 동작한다.

---

# J. History

## Smoke
- [ ] Undo가 동작한다.
- [ ] Redo가 동작한다.

## Regression
- [ ] Add → Undo
- [ ] Delete → Undo
- [ ] Resize → Undo
- [ ] Property 변경 → Undo
- [ ] Theme 변경 → Undo
- [ ] 여러 단계 Undo / Redo 후 State가 깨지지 않는다.
- [ ] 새로고침 후 History가 초기화되어도 Project 최신 상태는 유지된다.

---

# K. Structure Panel

## Regression
- [ ] Node Tree가 실제 구조와 일치한다.
- [ ] Tree 선택과 Canvas 선택이 동기화된다.
- [ ] Tree Reorder가 Canvas에 반영된다.
- [ ] Expand / Collapse가 동작한다.
- [ ] Lock 상태가 표시된다.

---

# L. Local Persistence

## Smoke
- [ ] Auto Save가 동작한다.
- [ ] 새로고침 후 복원된다.

## Regression
- [ ] Browser 재시작 후 Project가 유지된다.
- [ ] 여러 Project를 구분할 수 있다.
- [ ] 마지막 수정 시각이 갱신된다.
- [ ] 저장 중 JSON이 손상되지 않는다.

---

# M. JSON Import / Export

## Regression
- [ ] Project JSON Export 가능
- [ ] Export 파일을 Import 가능
- [ ] Import 결과가 원본과 동일
- [ ] 잘못된 JSON은 거부
- [ ] 지원하지 않는 schemaVersion은 안내
- [ ] 동일 Project ID 충돌을 안전하게 처리

---

# N. Preview

## Smoke
- [ ] Preview Mode 진입 가능
- [ ] Preview Mode 종료 가능

## Regression
- [ ] Grid가 숨겨진다.
- [ ] Selection Border가 숨겨진다.
- [ ] Resize Handle이 숨겨진다.
- [ ] Desktop Preview가 정상이다.
- [ ] Tablet Preview가 정상이다.
- [ ] Mobile Preview가 정상이다.
- [ ] Hover / Focus가 정상이다.

---

# O. React + Tailwind Export

## Release
- [ ] React 코드가 생성된다.
- [ ] Tailwind Class가 생성된다.
- [ ] Export 프로젝트 Build 성공
- [ ] Runtime Error 없음
- [ ] Canvas와 Export 결과가 시각적으로 유사
- [ ] Grid 구조 유지
- [ ] Flex 구조 유지
- [ ] Responsive 구조 유지
- [ ] Theme Token 반영
- [ ] 불필요한 Absolute Position 없음
- [ ] Component 이름이 읽을 수 있음

---

# P. Block & Layout Preset

## Regression
- [ ] 기본 Block 4종을 삽입할 수 있다.
- [ ] Block 내부 Node가 모두 생성된다.
- [ ] Node ID 충돌이 없다.
- [ ] Block 삽입 후 개별 Component 편집 가능
- [ ] Block 삭제 후 다른 Node에 영향 없음
- [ ] Blank Layout Preset으로 Project 생성 가능
- [ ] Sidebar + Main Layout Preset 적용 가능
- [ ] Header + Content Layout Preset 적용 가능

---

# Q. Performance

MVP에서는 절대 성능 목표보다 사용 가능한 수준인지 확인한다.

## Release
- [ ] Node 50개 수준의 화면이 안정적으로 편집 가능하다.
- [ ] Production Build에서 일반적인 선택/Property 변경에 눈에 띄는 지연이 없다.
- [ ] Drag 중 작업이 끊길 정도의 프레임 저하가 없다.
- [ ] Auto Save는 Debounce되어 편집 입력을 막지 않는다.
- [ ] Undo / Redo가 사용자 입력에 즉시 반응한다.

---

# R. Accessibility 기본 점검

## Release
- [ ] Button에 실제 button Element 사용
- [ ] Input Label 연결
- [ ] Keyboard Focus 표시
- [ ] 기본 Text Contrast 확보
- [ ] Icon-only Button에 Accessible Label 존재
- [ ] 기본 Component가 가능한 한 semantic HTML을 사용한다.
- [ ] Modal 구현 시 Focus 처리 가능 구조

---

# S. Representative Scenario Tests

Milestone 및 Release 시 아래 4개 화면을 직접 만든다.

## 1. Dashboard
구성:
- Sidebar
- Header
- KPI Card 3개
- Filter
- Table

확인:
- [ ] Grid
- [ ] Responsive
- [ ] Theme
- [ ] Export

## 2. Login
구성:
- Brand Text 또는 Logo Placeholder
- Input
- Password Input
- Button

확인:
- [ ] Form Layout
- [ ] Typography
- [ ] Mobile

## 3. Settings
구성:
- Sidebar Block
- Section
- Text
- Input
- Select
- Button

확인:
- [ ] Nested Layout
- [ ] Spacing / Typography Token
- [ ] Responsive

## 4. Data Table Page
구성:
- Header
- Search
- Filter
- Table
- Pagination Placeholder

확인:
- [ ] Dense Layout
- [ ] Compact Style
- [ ] Horizontal Overflow

---

# T. Phase Completion Checklist

모든 Phase 종료 시 아래를 확인한다.

- [ ] Phase 목표 달성
- [ ] Phase별 테스트 PASS
- [ ] Smoke Test PASS
- [ ] 기존 기능 Regression 없음
- [ ] Build PASS
- [ ] Console Error 없음
- [ ] Known Issue 기록
- [ ] Deferred 항목 기록
- [ ] Phase Result 문서 작성
- [ ] Commit 완료
- [ ] 다음 Phase 시작 가능

---

## 3. Release Gate

MVP Release는 다음 조건을 모두 만족해야 한다.

- [ ] GitHub Pages 실행
- [ ] Server Dependency 없음
- [ ] Component Drag & Drop 가능
- [ ] 기본 Block 4종 및 Layout Preset 3종 사용 가능
- [ ] Grid Snap Resize 가능
- [ ] Theme / Style 적용 가능
- [ ] Responsive 편집 가능
- [ ] Undo / Redo 가능
- [ ] IndexedDB 저장 / 복원 가능
- [ ] JSON Import / Export 가능
- [ ] Preview 가능
- [ ] React + Tailwind Export 가능
- [ ] Representative Scenario 4종 PASS
- [ ] Critical Bug 없음

---

## 4. Bug Severity

### Critical
- 앱 실행 불가
- Project 손실
- Export 불가
- Project JSON 손상

다음 Phase 또는 Release 진행 금지.

### Major
- 핵심 Component 편집 불가
- Responsive 오류
- Grid 오류
- Undo / Redo State 손상

원칙적으로 수정 후 진행.

### Minor
- Alignment Guide 오차
- 작은 UI 표시 문제
- 비핵심 UX 문제

Known Issue로 기록 후 진행 가능.
