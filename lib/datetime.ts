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

// F008: 이벤트 상태 자동 관리. 별도의 종료 일시가 없는 단일 일정 이벤트이므로,
// 백그라운드 크론 없이도 항상 최신 상태가 보장되도록 event_date와 오늘(KST) 날짜를
// 읽는 시점마다 비교해 계산한다. DB의 status 컬럼은 삽입 시 기본값만 채워질 뿐
// 신뢰하지 않는다(수정 시에도 갱신하지 않음).
export function getEventStatus(
  eventDateIso: string,
): "upcoming" | "ongoing" | "ended" {
  const toKstDateKey = (date: Date) =>
    new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const todayKey = toKstDateKey(new Date());
  const eventKey = toKstDateKey(new Date(eventDateIso));

  if (eventKey > todayKey) return "upcoming";
  if (eventKey === todayKey) return "ongoing";
  return "ended";
}
