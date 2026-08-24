import { EventForm } from "@/components/gather/event-form";

// Task 009: 이벤트 생성 API(F001) + Supabase Storage 커버 이미지 업로드(F009) 연동 예정
export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">새 이벤트 만들기</h1>
      <EventForm mode="create" />
    </div>
  );
}
