// Task 004: React Hook Form + Zod 기반 이벤트 생성 폼 구현 예정 (F001, F009)
export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">새 이벤트 만들기</h1>
      <p className="text-sm text-muted-foreground">
        제목, 날짜, 장소, 커버 이미지를 입력하는 폼이 여기에 표시됩니다.
      </p>
    </div>
  );
}
