// <input type="datetime-local">은 타임존 정보가 없는 "YYYY-MM-DDTHH:mm"을 반환한다.
// 서버 실행 환경의 로컬 타임존에 의존하지 않도록 한국 표준시(+09:00)로 명시적으로 해석한다.
export function parseKstDatetimeLocal(value: string) {
  return new Date(`${value}:00+09:00`).toISOString();
}

// ISO 문자열을 <input type="datetime-local">이 요구하는 "YYYY-MM-DDTHH:mm" 형식으로 변환한다.
// 수정 폼에서 기존 값을 미리 채울 때 사용한다.
export function toDatetimeLocalValue(isoDate: string) {
  const date = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
