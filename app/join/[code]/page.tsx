import { Suspense } from "react";

// Task 005/009: 이벤트 미리보기(F004) + 로그인 후 자동 참여 로직 구현 예정
async function JoinContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return <p className="text-sm text-muted-foreground">초대 코드: {code}</p>;
}

export default function JoinEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 p-5 text-center">
      <h1 className="text-2xl font-semibold">이벤트 초대</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <JoinContent params={params} />
      </Suspense>
    </main>
  );
}
