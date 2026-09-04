// UUID v4 생성기.
// P3는 crypto.randomUUID()를 폴백 없이 직접 사용한다.
// RFC 4122 v4 UUID 생성.

export function uuid(): string {
  return crypto.randomUUID();
}
