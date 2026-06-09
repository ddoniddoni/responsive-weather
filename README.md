# Responsive Weather

평면 세계지도 위에서 지역별 현재 날씨를 탐색하는 반응형 날씨 대시보드입니다.

처음에는 단순한 세계지도와 날씨 패널에서 출발했지만, 현재는 Windy와 비슷한 방향의 **지도 중심 날씨 탐색 경험**을 목표로 정리되어 있습니다. 지도 이동, 확대/축소, 날씨 레이어 전환, 대표 지역의 실시간 날씨 오버레이, 선택 지역 상세 패널을 한 화면 안에서 사용할 수 있습니다.

## 주요 기능

- MapLibre 기반 평면 세계지도
- 지도 드래그, 확대, 축소, 초기화
- 대표 지역 날씨 오버레이 표시
- 날씨 오버레이 켜기/끄기
- Open-Meteo 기반 현재 날씨 데이터 연동
- API 실패 시 mock 데이터 fallback
- 온도, 체감온도, 강수, 레이더, 바람, 구름, 기압, 습도 레이어 전환
- 국가 또는 대표 지점 선택 시 상세 날씨 패널 표시
- 모바일 화면용 하단 날씨 시트
- 라이트/다크 모드 전환
- 검색창을 통한 주요 지역 선택

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- MapLibre GL
- React Simple Maps
- Open-Meteo API
- npm

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```txt
http://localhost:3000
```

Windows PowerShell에서 실행 정책 문제로 `npm run ...` 명령이 막히면 다음처럼 실행할 수 있습니다.

```bash
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

## 검증 명령어

```bash
npm run lint
npm run build
```

## 프로젝트 구조

```txt
src/
  app/
    api/
    layout.tsx
    page.tsx
    globals.css
  components/
    dashboard/
    map/
    weather/
  constants/
  hooks/
  lib/
    map/
    weather/
  types/
steps/
```

### 주요 폴더

- `src/app`: Next.js App Router 페이지와 API Route
- `src/components/dashboard`: 전체 날씨 대시보드 조합 컴포넌트
- `src/components/map`: 지도, 지도 오버레이, 마커 관련 컴포넌트
- `src/components/weather`: 상세 날씨 패널과 날씨 UI 컴포넌트
- `src/constants`: 검색 지역, 날씨 레이어, 오버레이 기준 지점
- `src/hooks`: 날씨 오버레이 데이터 로딩 훅
- `src/lib/weather`: Open-Meteo 연동, mock 데이터, 날씨 데이터 변환 로직
- `src/types`: 공통 TypeScript 타입
- `steps`: Step 기반 작업 기록

## 데이터 흐름

```txt
대표 날씨 지점
-> Open-Meteo 현재 날씨 요청
-> 앱 내부 WeatherOverlayPoint 형태로 정규화
-> 지도 위 오버레이 레이어 표시
-> 사용자가 지점 선택
-> 상세 날씨 패널 또는 모바일 시트 표시
```

Open-Meteo 요청이 실패하면 앱은 mock 데이터를 사용해 화면이 비어 보이지 않도록 처리합니다.

## 현재 완성 범위

현재 프로젝트는 포트폴리오용 MVP 수준으로 다음 범위까지 구현되어 있습니다.

- 한 화면 중심의 날씨 지도 UI
- 지도 기반 탐색과 상세 패널 연결
- 실시간 날씨 오버레이의 기본 데이터 흐름
- 반응형 데스크톱/모바일 레이아웃
- 다크/라이트 테마
- API 실패 fallback
- Step 기반 개발 기록

## 남은 개선 여지

프로덕션 서비스로 확장하려면 다음 작업이 더 필요합니다.

- 지도 중복 표시와 카메라 제한의 추가 안정화
- Windy 수준의 실제 기상 타일 레이어 연동
- 시간대별 예보 애니메이션
- 더 넓은 지역 검색과 자동완성
- 현재 위치 기반 날씨
- 테스트 코드와 E2E 검증
- PRD/AGENTS 문서 인코딩 복구

## 프로젝트 상태

이 저장소는 날씨 지도 대시보드 포트폴리오 프로젝트입니다.

현재 작업 기준 브랜치는 `windy-map-stabilization`이며, 최근 불필요하게 쪼개졌던 Step 브랜치는 정리했습니다. 이후 작업을 이어간다면 지도 안정화와 실제 날씨 레이어 품질 개선을 우선순위로 두는 것이 좋습니다.
