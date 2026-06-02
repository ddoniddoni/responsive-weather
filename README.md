# Responsive Weather

Responsive Weather는 세계 지도를 탐색하며 국가와 지역을 선택하고, 선택한 위치의 mock 날씨 정보를 확인하는 반응형 날씨 대시보드입니다.

핵심 목표는 단순한 날씨 데이터 표시가 아니라, 선택한 위치와 날씨 상태에 따라 지도, 패널, 버튼, 카드 UI가 함께 반응하는 인터랙티브 경험을 제공하는 것입니다.

## 주요 기능

- 2D 지구본 기반 국가 탐색
- 국가 클릭 시 우측 날씨 대시보드 표시
- 선택 국가 핀 라벨과 `Detail` 버튼 표시
- `Detail` 버튼을 통한 지역 상세 모드 진입
- 지역 상세 모드에서 ADM1 행정구역 선택
- 지역 선택 시 우측 대시보드가 지역 날씨로 갱신
- `Globe` 버튼으로 국가 선택 상태의 지구본 화면 복귀
- 지도 확대/축소, 드래그 회전, reset 제어
- sunny, rainy, cloudy 등 날씨 상태별 반응형 UI 효과
- 라이트/다크 모드 전환

## 현재 범위

- 실제 날씨 API 대신 mock weather data를 사용합니다.
- 행정구역 경계는 geoBoundaries `gbOpen` 데이터를 서버 API route에서 proxy합니다.
- 큰 GeoJSON 응답은 Next.js fetch data cache 2MB 제한을 피하기 위해 본문 캐시를 사용하지 않습니다.
- 지역 상세 지도는 현재 SVG 기반 ADM1 경계 렌더링이며, 도로/지형/도시 라벨은 아직 포함하지 않습니다.
- 실제 타일 기반 상세 지도는 이후 MapLibre GL 같은 지도 엔진 도입 단계에서 확장할 예정입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Simple Maps
- d3-geo
- npm

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 검증

```bash
npm run lint
npm run build
```

Windows PowerShell 실행 정책으로 `npm.ps1`이 막히는 경우에는 다음처럼 실행할 수 있습니다.

```bash
npm.cmd run lint
npm.cmd run build
```

## 프로젝트 구조

- `src/app/page.tsx`: 메인 페이지
- `src/components/dashboard/`: 대시보드 조합 컴포넌트
- `src/components/map/`: 지구본, 지역 상세 지도, 행정구역 레이어
- `src/components/weather/`: 날씨 상세 패널, 반응형 버튼, metric card
- `src/hooks/`: 클라이언트 데이터 로딩 훅
- `src/lib/map/`: 행정구역 데이터 fetch/normalize 유틸
- `src/lib/weather/`: mock 날씨 데이터
- `src/types/`: 공통 TypeScript 타입
- `steps/`: Step 기반 작업 계획과 완료 기준

## 현재 사용 흐름

1. 지구본에서 국가를 클릭합니다.
2. 지구본이 선택 국가로 회전/확대되고 우측 대시보드에 국가 날씨가 표시됩니다.
3. 국가 핀 라벨의 `Detail` 버튼을 클릭합니다.
4. 지역 상세 모드에서 행정구역을 선택합니다.
5. 우측 대시보드가 선택 지역 날씨로 갱신됩니다.
6. `Globe` 버튼을 클릭하면 국가 선택 상태의 지구본 화면으로 돌아갑니다.
