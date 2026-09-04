// 무상태 정적 파일 서버.
// LLM 호출과 개인 데이터 저장은 전부 브라우저가 담당하므로,
// 이 서버는 빌드 산출물(dist/)만 서빙한다. API/DB/세션 없음.
//
// Vite base가 '/persora/'라 dist/ 안의 자산 경로도 그 하위를 가리킨다(TRD §6.4).
// 그래서 이 서버도 같은 하위 경로에 dist/를 마운트한다 — 루트에 그대로 마운트하면
// index.html이 참조하는 자산 경로와 서버가 실제로 서빙하는 경로가 어긋난다.
import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const BASE_PATH = '/persora';

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

app.use(compression());

// 경량 보안 헤더
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// 도메인 루트 접속은 base 경로로 보낸다.
app.get('/', (_req, res) => {
  res.redirect(302, `${BASE_PATH}/`);
});

app.use(
  BASE_PATH,
  express.static(DIST_DIR, {
    index: 'index.html',
    maxAge: '1h',
  }),
);

// base 경로 하위의 직접 진입(새로고침 등) 폴백. HashRouter라 서버 쪽 라우트 매칭은 필요 없다.
app.get(`${BASE_PATH}/*`, (_req, res) => {
  res.sendFile(join(DIST_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`\n  Persora (static) → http://localhost:${PORT}${BASE_PATH}/`);
  console.log(`  같은 네트워크의 휴대폰: http://[이 PC의 IP]:${PORT}${BASE_PATH}/\n`);
});
