import { Suspense } from "react";

import { AdminAnalyticsCharts } from "@/components/gather/admin-analytics-charts";
import { getAdminAnalyticsRawData } from "@/lib/supabase/gather-queries";

async function AdminAnalyticsContent() {
  const data = await getAdminAnalyticsRawData();
  return <AdminAnalyticsCharts data={data} />;
}

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">통계 분석</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <AdminAnalyticsContent />
      </Suspense>
    </div>
  );
}
