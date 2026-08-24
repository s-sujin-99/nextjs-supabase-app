import { EventForm } from "@/components/gather/event-form";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">새 이벤트 만들기</h1>
      <EventForm mode="create" />
    </div>
  );
}
