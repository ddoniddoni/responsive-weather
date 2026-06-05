# STEP-003: Open-Meteo 오버레이 데이터 연동

## 목표

- Step 002에서 만든 대표 날씨 지점 오버레이를 Open-Meteo 현재 날씨 데이터와 연결한다.
- 모든 국가를 계속 요청하지 않고, 대표 좌표 기반 요청으로 시작한다.
- API 응답은 UI에서 직접 사용하지 않고 앱 내부 `WeatherOverlayPoint[]` 데이터로 정규화한다.

## 작업 범위

- Open-Meteo 현재 날씨 응답 타입을 정의한다.
- Open-Meteo weather code를 앱의 `WeatherCondition` 타입으로 변환한다.
- 대표 날씨 지점 좌표를 기반으로 현재 날씨를 한 번에 요청하는 서버 API 라우트를 추가한다.
- 대시보드에서 오버레이 데이터를 불러오고, 로딩/에러/빈 상태를 사용자에게 표시한다.
- API 실패 시 기존 mock 데이터를 fallback으로 유지한다.

## 제외 범위

- 모든 국가 또는 모든 도시의 실시간 날씨 요청
- 레이더 타일, 위성 이미지, 경보 polygon
- 자동 반복 새로고침
- 사용자 계정, 저장 위치, 즐겨찾기
- 유료 API provider 연동

## 완료 기준

- `/api/weather-overlay`가 대표 지점의 Open-Meteo 현재 날씨를 반환한다.
- 반환 데이터는 `WeatherOverlayPoint[]` 형태로 정규화된다.
- 지도 오버레이는 실제 API 데이터가 있으면 해당 데이터를 사용하고, 실패 시 mock 데이터를 유지한다.
- 로딩, 에러, 빈 상태가 사용자에게 간단히 표시된다.
- `npm.cmd run lint`와 `npm.cmd run build`가 통과한다.

## 작업 체크리스트

- [x] Step 003 브랜치 생성
- [x] Step 003 계획 문서 작성
- [x] Open-Meteo 응답 타입 정의
- [x] weather code 정규화 함수 작성
- [x] `/api/weather-overlay` 라우트 추가
- [x] 대시보드 데이터 로딩 상태 연결
- [x] 오버레이 로딩/에러/빈 상태 UI 추가
- [x] README 현재 상태 업데이트
- [x] lint/build 검증
- [x] Step 003 커밋 및 push
