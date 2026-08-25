import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-5 w-12 shrink-0" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export function ParticipantCardSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** 이벤트 상세(/events/[eventId])와 초대 미리보기(/join/[code])가 공유하는
 * 커버 이미지 + 제목/메타 정보 레이아웃 스켈레톤. */
export function EventHeroSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-12 shrink-0" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <EventHeroSkeleton />
      <div className="flex gap-2">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <ParticipantCardSkeleton />
        <ParticipantCardSkeleton />
      </div>
    </div>
  );
}

export function JoinPreviewSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <EventHeroSkeleton />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function EventFormSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** 관리자 대시보드 지표(F012) 로딩 상태. */
export function AdminDashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** 관리자 이벤트/사용자 관리 테이블(F013, F014) 로딩 상태. */
export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-64" />
      <div className="flex flex-col gap-2 rounded-md border p-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/** 관리자 통계 분석 페이지(F015) 로딩 상태. */
export function AdminAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
