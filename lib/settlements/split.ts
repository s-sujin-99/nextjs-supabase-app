// 균등분배: total/n의 나머지를 앞에서부터 1원씩 배정해 합계가 total과 정확히 일치하도록 한다
export function splitEqually(
  totalAmount: number,
  memberCount: number,
): number[] {
  const base = Math.floor(totalAmount / memberCount);
  const remainder = totalAmount % memberCount;
  return Array.from({ length: memberCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}
