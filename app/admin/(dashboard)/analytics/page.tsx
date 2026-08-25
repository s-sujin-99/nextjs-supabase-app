import { Suspense } from "react";

import { AdminAnalyticsCharts } from "@/components/gather/admin-analytics-charts";
import { AdminAnalyticsSkeleton } from "@/components/gather/loading-skeleton";
import { getAdminAnalyticsRawData } from "@/lib/supabase/gather-queries";

async function AdminAnalyticsContent() {
  const data = await getAdminAnalyticsRawData();
  return <AdminAnalyticsCharts data={data} />;
}

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">통계 분석</h1>
      <Suspense fallback={<AdminAnalyticsSkeleton />}>
        <AdminAnalyticsContent />
      </Suspense>
    </div>
  );
}
