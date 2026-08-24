// Task 011: Recharts 기반 이벤트/사용자 증가 추이 그래프(F015) 구현 예정
export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">통계 분석</h1>
      <p className="text-sm text-muted-foreground">
        최근 7일 이벤트/사용자 증가 추이 그래프가 여기에 표시됩니다.
      </p>
    </div>
  );
}
