import { Suspense } from "react";

// Task 004: 이벤트 정보, 초대 링크 공유(F002, F003), 참여자 목록(F005) UI 구현 예정
async function EventDetailContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <p className="text-sm text-muted-foreground">이벤트 ID: {eventId}</p>;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">이벤트 상세</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EventDetailContent params={params} />
      </Suspense>
    </div>
  );
}
