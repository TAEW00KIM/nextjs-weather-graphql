# Weather App

Open Weather API를 사용하여 도시별 현재 날씨와 5일 예보를 보여주는 웹 애플리케이션입니다.

**Live Demo**: https://weather-app-beta-two-73.vercel.app

## 기술 스택

- **Next.js 12** — 프론트엔드 및 백엔드
- **GraphQL + Apollo Server** — 백엔드 API (`/api/graphql`)
- **Apollo Client** — 클라이언트 GraphQL 요청
- **Module CSS** — 컴포넌트 스타일링
- **Open Weather API** — 날씨 데이터

## 설정 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Open Weather API 키를 입력합니다.

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 `your_api_key_here` 부분을 실제 API 키로 교체합니다.

```
OPENWEATHER_API_KEY=your_api_key_here
```

> API 키는 [openweathermap.org](https://openweathermap.org/) 에서 무료 회원가입 후 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 페이지 — 도시 선택 |
| `/Seoul` | 서울 현재 날씨 + 5일 예보 |
| `/Tokyo` | 도쿄 현재 날씨 + 5일 예보 |
| `/Paris` | 파리 현재 날씨 + 5일 예보 |
| `/London` | 런던 현재 날씨 + 5일 예보 |

## 반응형 레이아웃

| 구간 | 동작 |
|------|------|
| 1280px 이상 | 콘텐츠 중앙 정렬 (max-width 고정) |
| 800px ~ 1280px | width 100% |
| 800px 미만 | 최소 너비 800px 고정, 가로 스크롤 |

## 설계 결정

- **인구수(`population`)** — OWM Current Weather API에는 인구수가 없고 5 day Forecast API 응답의 `city.population`에만 포함되어 있습니다. `currentWeather` resolver에서 두 API를 `Promise.all`로 병렬 호출해 population을 `CurrentWeather` 타입에 매핑했습니다.
