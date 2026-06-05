# 리서치 및 구현 과정

**Next.js SSG**, **GraphQL**, **Apollo Server/Client**는 이번 과제에서 처음 실제로 적용한 기술들입니다. next/image와 모바일 viewport 대응에서 발생한 이슈도 함께 기록합니다.

---

## 1. Next.js SSG (Static Site Generation)

### 배경

Next.js는 알고 있었지만 `getStaticPaths`와 `getStaticProps` 조합을 실제 프로젝트에 써본 적은 없었습니다. 도시별 페이지를 빌드 타임에 생성해두면 응답 속도와 SEO 모두 유리해 SSG를 선택했습니다.

### 리서치

`getStaticPaths`는 빌드 타임에 생성할 경로 목록을 반환합니다. `fallback: false`로 설정하면 목록 외 경로는 404로 처리됩니다.

`getStaticProps`는 각 경로마다 실행되고, 반환한 `props`가 페이지 컴포넌트에 주입됩니다. `revalidate` 옵션을 주면 ISR이 활성화되어 빌드 이후에도 주기적으로 페이지를 재생성합니다. 날씨 데이터는 실시간 갱신보다 10분 주기가 적합해 `revalidate: 600`으로 설정했습니다.

### 구현

```js
export async function getStaticPaths() {
  return {
    paths: process.env.OPENWEATHER_API_KEY
      ? CITIES.map((city) => ({ params: { city } }))
      : [],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { city } = params;
  try {
    const [weather, forecast] = await Promise.all([
      client.query({ query: GET_CURRENT_WEATHER, variables: { city } }),
      client.query({ query: GET_FORECAST, variables: { city } }),
    ]);
    return {
      props: { weather: weather.data.currentWeather, forecast: forecast.data.forecast },
      revalidate: 600,
    };
  } catch {
    return { notFound: true };
  }
}
```

### 이슈: API 키 없이 빌드 시 오류 로그

API 키가 없는 환경에서 `npm run build`를 실행하면 `getStaticPaths`에 정의된 도시마다 SSG가 시도되고, OpenWeatherMap API 호출이 실패해 `notFound` 로그가 대량 출력됩니다.

`getStaticPaths`에서 `OPENWEATHER_API_KEY` 유무를 확인해 키가 없으면 빈 배열을 반환하도록 처리했습니다. 빌드는 정상 완료되고 런타임에 fallback으로 대응합니다.

---

## 2. GraphQL

### 배경

REST API는 익숙하지만 GraphQL은 개념만 알고 있었습니다. OpenWeatherMap 응답에는 불필요한 필드가 많아, 필요한 필드만 요청하는 GraphQL이 적합했습니다.

### 리서치

Schema-first 방식으로 `typeDefs`에서 타입과 쿼리를 먼저 정의하고 resolver에서 실제 데이터를 채웁니다. 프론트엔드가 필요한 필드를 스키마 수준에서 명확하게 표현할 수 있습니다.

`gql` 태그는 쿼리 문자열을 AST로 파싱하는 태그 함수로, Apollo 서버와 클라이언트 양쪽에서 사용합니다. `city: String!`처럼 인수를 스키마에 선언하면 동적 쿼리를 작성할 수 있습니다.

### 스키마 설계

```graphql
type CurrentWeather {
  city: String!
  country: String!
  population: Int
  datetime: String!
  temp: Float!
  feelsLike: Float!
  description: String!
  icon: String!
  windSpeed: Float!
  humidity: Int!
}

type ForecastDay {
  date: String!
  slots: [ForecastSlot!]!
}

type Query {
  currentWeather(city: String!): CurrentWeather!
  forecast(city: String!): [ForecastDay!]!
}
```

OpenWeatherMap의 복잡한 응답 구조는 서버 측 resolver에서 변환하고, 클라이언트는 위 타입만 다루도록 설계했습니다.

---

## 3. Apollo Server + Apollo Client

### 배경

Apollo를 직접 서버로 띄우거나 클라이언트를 설정해본 경험이 없었습니다. 리서치 중 `apollo-server-micro`로 Next.js API Route에 Apollo 서버를 올리면 별도 백엔드 없이 구현 가능하다는 걸 알게 됐습니다.

### Apollo Server

Next.js API Route는 Node.js HTTP handler 형태입니다. `apollo-server-micro`는 이 구조에 그대로 통합할 수 있는 경량 Apollo 서버입니다.

```js
// pages/api/graphql.js
const apolloServer = new ApolloServer({ typeDefs, resolvers });
const startServer = apolloServer.start();

export default cors(async function handler(req, res) {
  await startServer;
  await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
});

export const config = { api: { bodyParser: false } };
```

`apolloServer.start()`를 handler 밖에서 호출해두고 handler 안에서 await합니다. cold start 시 중복 초기화를 방지하는 패턴입니다. `bodyParser: false`는 필수 설정으로, Apollo Server가 body를 직접 파싱하기 때문입니다. CORS 처리는 `micro-cors`를 래퍼로 사용했습니다.

### Resolver

```js
// graphql/resolvers.js
export const resolvers = {
  Query: {
    currentWeather: async (_, { city }) => {
      const [current, forecast] = await Promise.all([
        getCurrentWeather(city),
        getForecastCached(city),
      ]);
      return {
        city: current.name,
        temp: round(current.main.temp, 2),
        // ...
      };
    },
  },
};
```

`currentWeather`와 `forecast` 쿼리가 같은 도시를 요청할 때 중복 API 호출을 피하기 위해 `memoize`로 `getForecast`를 캐싱했습니다. UTC에서 현지 시간으로 변환하는 로직은 `formatters.js`로 분리했습니다.

### Apollo Client와 SSG 연동

```js
// graphql/queries.js
export const GET_CURRENT_WEATHER = gql`
  query GetCurrentWeather($city: String!) {
    currentWeather(city: $city) {
      city country population datetime
      temp feelsLike description icon windSpeed humidity
    }
  }
`;
```

`getStaticProps` 안에서 Apollo Client로 자체 GraphQL 엔드포인트를 직접 호출해 빌드 타임에 데이터를 패칭합니다. 클라이언트 번들에는 API 키와 외부 요청 로직이 포함되지 않습니다.

---

## 4. 이슈 해결 기록

### next/image: hostname 설정과 테스트 대응

`<img>` 태그로 OpenWeatherMap 아이콘을 사용하면 ESLint `@next/next/no-img-element` 경고가 발생합니다. `next/image`로 교체하면 자동 최적화와 lazy loading이 적용되지만 `next.config.js`에 허용 도메인을 명시해야 합니다.

```js
// next.config.js
images: { domains: ['openweathermap.org'] }
```

next/jest는 `next/image`를 stub으로 대체할 때 `src` 속성을 `data:image/gif...` placeholder로 치환합니다. `toHaveAttribute('src', 'https://...')` 단언은 실패하므로, `toBeInTheDocument()`로 존재 여부만 확인하도록 수정했습니다.

### 모바일 Viewport: iOS Safari 자동 축소

`body { min-width: 800px }` 레이아웃에서 iOS Safari는 뷰포트를 800px로 확장한 뒤 축소해 표시합니다. 800px 미만 화면에서 가로 스크롤 대신 줌아웃이 발생하는 문제였습니다.

원인은 `_document.js`에 `width=800` viewport가 설정되어 있어 `_app.js`의 `width=device-width`와 충돌한 것이었습니다. `_document.js`에서 viewport meta를 제거하고 `_app.js`에 `minimum-scale=1`을 추가해 iOS 자동 줌을 막았습니다.

```jsx
// pages/_app.js
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
```

---

## 정리

| 기술 | 적용 목적 | 주요 학습 포인트 |
|------|-----------|-----------------|
| Next.js SSG (ISR) | 빌드 타임 페이지 생성 + 주기적 갱신 | getStaticPaths/getStaticProps 조합, revalidate |
| GraphQL Schema | REST 응답 정제, 타입 안전성 | typeDefs 설계, Query 인수 |
| Apollo Server Micro | Next.js API Route 내 GraphQL 서버 | bodyParser 설정, start() 비동기 처리 |
| Apollo Client | SSG에서 GraphQL 데이터 패칭 | gql 태그, variables 전달 |
| next/image | 이미지 최적화, lint 대응 | domains 설정, jest stub 패턴 |
| Viewport / CSS Modules | 모바일 대응 | minimum-scale, media query 분리 |
