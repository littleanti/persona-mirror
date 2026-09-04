// public/ 자산의 배포 경로 헬퍼(TRD §3.14).
// GitHub Pages 프로젝트 사이트는 `/persora/` 하위에 배포되므로 `/app-logo.png`처럼
// 도메인 루트를 가리키는 절대 경로는 404가 된다. Vite가 번들에 넣는
// `import.meta.env.BASE_URL`(= vite.config.ts의 base)을 앞에 붙여 개발(`/`)과
// 배포(`/persora/`) 양쪽에서 같은 코드가 맞는 경로를 만든다.

/** public/ 아래의 파일 경로를 현재 배포 base 기준 경로로 바꾼다. */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export const APP_LOGO_SRC = publicAsset('app-logo.png');
