// <input type="datetime-local">은 타임존 정보가 없는 "YYYY-MM-DDTHH:mm"을 반환한다.
// 서버 실행 환경의 로컬 타임존에 의존하지 않도록 한국 표준시(+09:00)로 명시적으로 해석한다.
export function parseKstDatetimeLocal(value: string) {
  return new Date(`${value}:00+09:00`).toISOString();
}
