import { AdminAnalyticsCharts } from "@/components/gather/admin-analytics-charts";

// Task 011: Supabase 집계 쿼리 기반 실제 추이 데이터(F015)로 교체 예정
export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">통계 분석</h1>
      <AdminAnalyticsCharts />
    </div>
  );
}
