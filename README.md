# Responsive Weather

Responsive Weather는 세계지도를 탐색하며 국가/지역을 선택하면, 해당 위치의 날씨 정보를 확인할 수 있는 인터랙티브 웹 애플리케이션입니다.

이 프로젝트의 핵심은 단순 정보 표시가 아니라, 날씨 상태에 따라 UI 분위기(패널, 버튼, 카드 스타일)가 함께 반응하는 사용자 경험입니다.

## 주요 목표

- 지도 기반으로 직관적인 지역 선택 제공
- 선택한 지역의 상세 날씨 정보 표시
- 날씨 상태(sunny, rainy, cloudy 등)에 따라 UI 반응
- 데스크톱/태블릿/모바일 반응형 레이아웃 지원

## MVP 범위

- Home 대시보드 화면
- 2D 세계지도 UI
- 지도 확대/축소 버튼
- 국가/지역 선택 상태 관리
- 지역 선택 후 `지도 70% + 우측 패널 30%` 레이아웃(데스크톱)
- 모바일 세로 배치 레이아웃
- Mock 날씨 데이터 기반 상세 패널
- 기본 날씨 UI variant (`sunny`, `rainy`, `cloudy`)

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (PRD 기준)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 프로젝트 구조

- `src/app/page.tsx`: 메인 화면
- `src/app/layout.tsx`: 전역 레이아웃
- `src/app/globals.css`: 전역 스타일

