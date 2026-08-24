import { Suspense } from "react";

// Task 004: 이벤트 수정 폼 구현 예정 (F006, F009) - 주최자만 접근 가능
async function EditEventContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <p className="text-sm text-muted-foreground">이벤트 ID: {eventId}</p>;
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">이벤트 수정</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EditEventContent params={params} />
      </Suspense>
    </div>
  );
}
