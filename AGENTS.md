# AGENTS.md

# AGENTS.md

## 1. 기본 원칙

이 문서는 Codex가 이 프로젝트에서 개발할 때 반드시 지켜야 하는 작업 규칙이다.

제품 요구사항과 기능 설명은 `PRD.md`를 기준으로 확인한다.

Codex는 작업 전 다음 순서로 프로젝트를 파악한다.

1. `PRD.md` 확인
2. `AGENTS.md` 확인
3. `package.json` 확인
4. 현재 폴더 구조 확인
5. 요청받은 작업과 관련된 파일 확인

Codex는 사용자가 요청한 범위 안에서만 작업한다.

---

## 2. 패키지 매니저 규칙

이 프로젝트는 반드시 **npm**을 사용한다.

허용되는 명령어는 npm 기반 명령어다.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run typecheck
```

다음 패키지 매니저는 사용하지 않는다.

```bash
pnpm
yarn
bun
```

`package-lock.json`을 기준으로 의존성을 관리한다.

`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`를 새로 만들지 않는다.

---

## 3. 실행 명령어 규칙

명령어를 실행하기 전 반드시 `package.json`의 scripts를 확인한다.

기본적으로 다음 명령어를 사용한다.

```bash
npm run dev
npm run build
npm run lint
```

다음 스크립트가 존재하는 경우에만 실행한다.

```bash
npm run test
npm run typecheck
```

스크립트가 존재하지 않으면 임의로 실행하지 않는다.

필요한 스크립트가 없을 경우, 사용자에게 추가를 제안하거나 작업 요약에 남긴다.

---

## 4. 기술 스택 규칙

이 프로젝트는 다음 기술을 기준으로 개발한다.

- Next.js 최신 버전
- TypeScript
- Tailwind CSS
- shadcn/ui
- npm

Codex는 사용자가 요청하지 않는 한 핵심 기술 스택을 변경하지 않는다.

금지 예시:

- Next.js를 Vite로 변경
- Tailwind CSS 대신 styled-components로 변경
- shadcn/ui 대신 다른 UI 라이브러리로 교체
- npm 대신 pnpm, yarn, bun 사용

---

## 5. 폴더 구조 규칙

권장 폴더 구조는 다음과 같다.

```bash
app/
  layout.tsx
  page.tsx
  globals.css

components/
  ui/
  layout/
  map/
  weather/
  dashboard/

hooks/

lib/
  weather/
  map/
  utils.ts

types/

constants/
```

폴더 역할은 다음 기준을 따른다.

- `app/`: Next.js App Router 페이지와 레이아웃
- `components/ui/`: shadcn/ui 컴포넌트
- `components/layout/`: 공통 레이아웃 컴포넌트
- `components/map/`: 지도 관련 컴포넌트
- `components/weather/`: 날씨 관련 컴포넌트
- `components/dashboard/`: 대시보드 조합 컴포넌트
- `hooks/`: 커스텀 훅
- `lib/`: API 요청, 데이터 변환, 유틸 함수
- `types/`: 공통 TypeScript 타입
- `constants/`: 상수값

기존 프로젝트 구조가 이미 다르게 구성되어 있다면, 무리하게 전체 구조를 바꾸지 않는다.

---

## 6. 파일명 규칙

파일명은 기본적으로 `kebab-case`를 사용한다.

좋은 예시:

```bash
weather-panel.tsx
world-map.tsx
map-controls.tsx
use-map-zoom.ts
normalize-weather.ts
```

피해야 할 예시:

```bash
WeatherPanel.tsx
worldMap.tsx
map_controls.tsx
```

단, Next.js에서 요구하는 파일명은 그대로 따른다.

```bash
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

---

## 7. TypeScript 규칙

TypeScript를 엄격하게 작성한다.

- 가능한 한 `any`를 사용하지 않는다.
- 외부 API 응답은 별도 타입으로 정의한다.
- 컴포넌트 props 타입을 명시한다.
- 복잡한 타입은 별도 파일로 분리한다.
- nullable 값은 반드시 처리한다.
- 타입 오류를 임시로 숨기지 않는다.

금지 예시:

```ts
const data: any = response;
```

```ts
// @ts-ignore
const value = data.value;
```

정말 필요한 경우에는 이유를 명확히 남기고 `@ts-expect-error`를 사용한다.

```ts
// @ts-expect-error 외부 라이브러리 타입 정의가 실제 런타임 값과 다름
const value = external.value;
```

---

## 8. 네이밍 규칙

다음 네이밍 규칙을 따른다.

- React 컴포넌트: `PascalCase`
- TypeScript 타입: `PascalCase`
- 함수: `camelCase`
- 변수: `camelCase`
- 커스텀 훅: `useSomething`
- 상수: `UPPER_SNAKE_CASE`
- 파일명: `kebab-case`

예시:

```ts
type WeatherCondition = "sunny" | "rainy" | "cloudy";

const DEFAULT_ZOOM_LEVEL = 1;

function normalizeWeather() {}

function useMapZoom() {}

export function WeatherPanel() {}
```

---

## 9. Export 규칙

가능하면 named export를 사용한다.

```ts
export function WeatherPanel() {}
```

default export는 Next.js가 요구하는 파일에서 사용한다.

```tsx
export default function HomePage() {
  return <main />;
}
```

Barrel export는 프로젝트 규모가 커졌을 때만 신중하게 사용한다.

---

## 10. Import 규칙

절대 경로 alias `@/`를 우선 사용한다.

좋은 예시:

```ts
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeatherCondition } from "@/types/weather";
```

피해야 할 예시:

```ts
import { Button } from "../../../components/ui/button";
```

Import 순서는 다음을 권장한다.

1. React, Next.js
2. 외부 라이브러리
3. 내부 컴포넌트
4. 내부 훅, 유틸, 상수
5. 타입 import
6. CSS 또는 asset

---

## 11. Next.js 규칙

Next.js App Router 기준으로 개발한다.

- 기본은 Server Component로 작성한다.
- 인터랙션이 필요한 경우에만 Client Component를 사용한다.
- `use client`는 필요한 파일에만 선언한다.
- 페이지 파일은 가능한 얇게 유지한다.
- 실제 UI 구현은 `components/`로 분리한다.
- 서버에서 처리 가능한 데이터 요청은 서버에서 처리한다.
- 클라이언트 상태는 필요한 최소 범위에서만 사용한다.

예시:

```tsx
import { WeatherDashboard } from "@/components/dashboard/weather-dashboard";

export default function HomePage() {
  return <WeatherDashboard />;
}
```

---

## 12. React 컴포넌트 규칙

컴포넌트는 작고 명확하게 작성한다.

- 하나의 컴포넌트는 하나의 역할을 가진다.
- props 이름은 명확하게 작성한다.
- 조건부 렌더링은 읽기 쉽게 작성한다.
- 긴 JSX는 하위 컴포넌트로 분리한다.
- 같은 UI 패턴이 반복되면 공통 컴포넌트로 분리한다.
- 불필요한 memoization은 하지 않는다.

좋은 컴포넌트 분리 예시:

```bash
components/dashboard/weather-dashboard.tsx
components/map/world-map.tsx
components/map/map-controls.tsx
components/weather/weather-panel.tsx
components/weather/weather-reactive-button.tsx
```

---

## 13. shadcn/ui 규칙

UI 컴포넌트는 shadcn/ui를 우선 사용한다.

주로 사용할 수 있는 컴포넌트:

- Button
- Card
- Sheet
- Dialog
- Drawer
- Tooltip
- Badge
- Skeleton
- Separator

규칙:

- 기본 버튼, 카드, 패널은 shadcn/ui 기반으로 작성한다.
- shadcn/ui 원본 컴포넌트는 불필요하게 크게 수정하지 않는다.
- 커스텀 스타일은 래퍼 컴포넌트에서 확장한다.
- `className` 확장은 `cn()` 유틸을 사용한다.
- 새로운 UI 라이브러리를 임의로 추가하지 않는다.

---

## 14. Tailwind CSS 규칙

스타일링은 Tailwind CSS를 우선 사용한다.

- 레이아웃, spacing, color, typography는 Tailwind class로 작성한다.
- 반복되는 class 조합은 `cn()` 또는 variant 객체로 분리한다.
- 전역 CSS는 최소화한다.
- 애니메이션, 지도 효과, 날씨 효과처럼 필요한 경우에만 global CSS를 사용한다.
- 반응형 처리는 Tailwind breakpoint를 사용한다.

좋은 예시:

```tsx
<div className="grid min-h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
  ...
</div>
```

---

## 15. 상태 관리 규칙

초기 단계에서는 React 기본 상태를 우선 사용한다.

다음 상태는 로컬 상태 또는 커스텀 훅으로 관리할 수 있다.

- 선택된 국가/지역
- 지도 줌 레벨
- 날씨 패널 열림 여부
- 로딩 상태
- 에러 상태

사용자가 요청하지 않는 한 전역 상태 라이브러리를 추가하지 않는다.

상태가 복잡해지면 먼저 커스텀 훅으로 분리한다.

예시:

```ts
function useMapZoom() {}

function useSelectedCountry() {}

function useWeatherTheme() {}
```

---

## 16. 지도 구현 규칙

지도 관련 코드는 `components/map/`, `hooks/`, `lib/map/`에 분리한다.

지도 구현 시 다음 규칙을 지킨다.

- 확대/축소 로직은 별도 훅 또는 명확한 함수로 분리한다.
- 국가 선택 로직과 날씨 패널 로직을 섞지 않는다.
- 지도 위에 날씨 정보를 직접 표시하지 않는다.
- 지도 컴포넌트는 지도 표시와 지역 선택에 집중한다.
- 선택된 국가/지역 상태는 상위 컴포넌트에서 관리한다.

권장 컴포넌트:

```bash
world-map.tsx
map-controls.tsx
country-layer.tsx
```

---

## 17. 날씨 UI 규칙

날씨 상태별 UI는 매핑 객체로 관리한다.

컴포넌트 내부에 조건문을 과도하게 작성하지 않는다.

좋은 예시:

```ts
const WEATHER_THEME_MAP = {
  sunny: {
    panelClassName: "bg-yellow-50 text-yellow-950",
    buttonClassName: "shadow-lg",
  },
  rainy: {
    panelClassName: "bg-slate-900 text-slate-50",
    buttonClassName: "shadow-md",
  },
};
```

날씨 상태 타입은 확장 가능한 구조로 작성한다.

```ts
type WeatherCondition =
  | "sunny"
  | "rainy"
  | "cloudy"
  | "snowy"
  | "stormy"
  | "foggy"
  | "unknown";
```

---

## 18. API 및 데이터 처리 규칙

날씨 API 연결 시 다음 규칙을 지킨다.

- API Key는 환경변수로 관리한다.
- Secret Key를 클라이언트에 노출하지 않는다.
- API 응답을 UI에서 직접 사용하지 않는다.
- `normalizeWeather()` 같은 변환 함수를 사용한다.
- 로딩, 에러, 빈 상태를 반드시 처리한다.
- API 요청 로직은 컴포넌트 내부에 길게 작성하지 않는다.
- API 관련 코드는 `lib/weather/`에 둔다.

환경변수 예시:

```bash
WEATHER_API_KEY=
NEXT_PUBLIC_WEATHER_API_BASE_URL=
```

주의:

- 브라우저에 노출되어도 되는 값만 `NEXT_PUBLIC_` prefix를 사용한다.
- 민감한 키는 절대 `NEXT_PUBLIC_` prefix를 붙이지 않는다.

---

## 19. 접근성 규칙

접근성을 고려해서 작성한다.

- 버튼에는 명확한 `aria-label`을 제공한다.
- 아이콘만 있는 버튼은 스크린 리더용 텍스트를 포함한다.
- 날씨 상태를 색상만으로 구분하지 않는다.
- 키보드로 주요 인터랙션이 가능하도록 고려한다.
- 애니메이션은 사용성을 해치지 않게 한다.
- 패널이 열릴 때 포커스 흐름을 방해하지 않는다.

예시:

```tsx
<Button aria-label="지도 확대">+</Button>
<Button aria-label="지도 축소">-</Button>
```

---

## 20. 반응형 규칙

이 프로젝트는 반응형 UI를 중요하게 다룬다.

반드시 고려할 화면 크기:

- Mobile
- Tablet
- Desktop

규칙:

- 모바일에서는 지도와 패널을 세로로 배치한다.
- 데스크톱에서는 지도와 패널을 가로로 배치한다.
- 클릭 가능한 요소는 모바일에서도 충분히 크게 만든다.
- 고정 너비를 과도하게 사용하지 않는다.
- `overflow` 문제가 생기지 않도록 확인한다.
- 지도 영역은 작은 화면에서도 사용할 수 있어야 한다.

---

## 21. 로딩, 에러, 빈 상태 규칙

비동기 데이터가 있는 경우 다음 상태를 반드시 고려한다.

### Loading

- Skeleton 또는 loading UI를 제공한다.
- 화면 전체가 멈춘 것처럼 보이지 않게 한다.

### Error

- 사용자에게 이해 가능한 메시지를 보여준다.
- 개발자용 에러를 그대로 노출하지 않는다.

### Empty

- 선택된 국가가 없을 때는 안내 메시지를 보여주거나 패널을 숨긴다.
- 날씨 데이터가 없을 때는 fallback UI를 제공한다.

---

## 22. 테스트 규칙

테스트 환경이 있는 경우 다음 기능을 우선 테스트한다.

- 지도 확대 버튼 클릭
- 지도 축소 버튼 클릭
- 국가 선택
- 선택된 국가 변경
- 날씨 패널 표시
- 날씨 condition에 따른 UI variant 변경
- 로딩 상태 표시
- 에러 상태 표시

테스트 도구가 없는 경우 임의로 대규모 테스트 환경을 추가하지 않는다.

사용자가 요청하면 다음 도구를 제안할 수 있다.

- Vitest
- React Testing Library
- Playwright

---

## 23. 빌드 규칙

작업 완료 전 가능한 경우 다음 명령어를 실행한다.

```bash
npm run build
```

빌드 실패 시 다음 순서로 확인한다.

1. TypeScript 타입 오류
2. import 경로 오류
3. Server Component / Client Component 경계 오류
4. 환경변수 누락
5. 외부 라이브러리 사용 오류
6. Tailwind 또는 shadcn/ui import 오류

빌드 오류를 임시방편으로 숨기지 않는다.

---

## 24. 린트 규칙

작업 완료 전 가능한 경우 다음 명령어를 실행한다.

```bash
npm run lint
```

린트 오류는 가능한 수정한다.

단, 기존 코드 전체에서 발생하는 unrelated lint 오류는 작업 범위 밖이면 건드리지 않는다.

작업한 코드와 관련된 린트 오류를 우선 수정한다.

---

## 25. 리뷰 규칙

작업 완료 후 다음 내용을 요약한다.

- 구현한 내용
- 수정한 파일
- 실행한 검증 명령어
- 실패한 검증 명령어와 이유
- 추가로 확인이 필요한 부분

응답 형식은 다음을 따른다.

```md
## 작업 완료

### 구현 내용

- ...

### 수정한 파일

- ...

### 검증

- npm run lint
- npm run build

### 참고

- ...
```

검증을 실행하지 못한 경우 다음처럼 명확히 작성한다.

```md
### 검증

- npm run build: 실행하지 못함
  - 이유: package.json에 build 스크립트가 없음
```

---

## 26. 금지 사항

Codex는 다음 행동을 하지 않는다.

- npm이 아닌 패키지 매니저 사용
- 사용자가 요청하지 않은 라이브러리 추가
- 사용자가 요청하지 않은 대규모 리팩토링
- `.env`, `.env.local`에 있는 secret 값 노출
- API Key 하드코딩
- TypeScript 오류를 `any`로 덮기
- TypeScript 오류를 `@ts-ignore`로 숨기기
- 빌드 오류를 무시하고 완료했다고 말하기
- shadcn/ui 기본 컴포넌트의 불필요한 대규모 수정
- 기존 폴더 구조 전체를 임의로 변경
- 제품 요구사항을 임의로 바꾸기
- 지도에 날씨 정보를 직접 표시하는 방식으로 요구사항 변경
- 사용자가 요청하지 않은 인증, DB, 결제 기능 추가
- package manager 변경
- lockfile 혼용

---

## 27. 작업 우선순위

기능 구현 시 다음 우선순위를 따른다.

1. 사용자가 요청한 기능 구현
2. TypeScript 타입 안정성
3. 반응형 UI
4. 접근성
5. 코드 재사용성
6. 테스트 가능성
7. 시각적 완성도

시각적 효과를 위해 코드 안정성이나 접근성을 희생하지 않는다.

---

## 28. 커밋/PR 요약 규칙

변경 요약은 간결하고 명확하게 작성한다.

예시:

```md
## 변경 사항

- 지도 대시보드 레이아웃 추가
- 국가 선택 상태 추가
- 날씨 상세 패널 UI 추가
- 날씨 상태별 버튼 variant 추가

## 검증

- npm run lint
- npm run build

## 참고 사항

- 현재 날씨 데이터는 mock 데이터를 사용함
- 실제 API 연동은 추후 작업 필요
```

---

## 29. 완료 기준

Codex가 작업을 완료했다고 판단하려면 다음 조건을 확인한다.

- 요청한 기능이 구현되었다.
- TypeScript 타입 오류가 없다.
- 가능한 경우 build가 통과한다.
- 가능한 경우 lint가 통과한다.
- 모바일과 데스크톱 레이아웃을 고려했다.
- 작업 범위를 벗어난 변경을 하지 않았다.
- 검증하지 못한 부분은 명확히 기록했다.

---

## 30. 테마 모드 규칙

이 프로젝트는 기본적으로 다크/라이트 모드를 구현한다.

- 다크 모드와 라이트 모드를 모두 지원한다.
- 사용자가 모드를 전환할 수 있는 버튼(토글)을 제공한다.
- 테마 전환은 주요 화면(지도, 패널, 버튼 등)에서 일관되게 반영되어야 한다.
