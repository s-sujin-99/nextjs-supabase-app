"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toKstDateKey } from "@/lib/datetime";
import type {
  AdminAnalyticsRawData,
  AnalyticsDataPoint,
  AnalyticsRange,
} from "@/lib/types";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
];

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function formatAxisDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(date));
}

/** 생성일시 목록을 오늘 기준 최근 N일간 날짜별 개수로 집계한다. */
function bucketByDay(dates: string[], days: number): AnalyticsDataPoint[] {
  const countByKey = new Map<string, number>();
  for (const iso of dates) {
    const key = toKstDateKey(new Date(iso));
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }

  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const key = toKstDateKey(date);
    return { date: key, count: countByKey.get(key) ?? 0 };
  });
}

export function AdminAnalyticsCharts({
  data,
}: {
  data: AdminAnalyticsRawData;
}) {
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const days = RANGE_DAYS[range];
  const eventTrend = useMemo(
    () => bucketByDay(data.eventDates, days),
    [data.eventDates, days],
  );
  const userTrend = useMemo(
    () => bucketByDay(data.userDates, days),
    [data.userDates, days],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="총 이벤트 수" value={data.totalEvents} />
          <SummaryCard label="총 사용자 수" value={data.totalUsers} />
          <SummaryCard
            label="평균 참여자 수"
            value={data.averageParticipants}
          />
        </div>
        <Select
          value={range}
          onValueChange={(value) => setRange(value as AnalyticsRange)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TrendChart title="이벤트 생성 추이" points={eventTrend} />
      <TrendChart title="사용자 증가 추이" points={userTrend} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TrendChart({
  title,
  points,
}: {
  title: string;
  points: Array<{ date: string; count: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                fontSize={12}
              />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip
                labelFormatter={(label) => formatAxisDate(String(label))}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
