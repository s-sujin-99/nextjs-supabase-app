"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface JoinButtonProps {
  eventId: string;
  eventTitle: string;
}

export function JoinButton({ eventId, eventTitle }: JoinButtonProps) {
  const router = useRouter();

  const handleJoin = () => {
    // Task 010: event_participants insert 및 실시간 참여자 목록 반영 예정
    toast.success(`"${eventTitle}" 참여가 완료됐어요!`);
    router.push(`/events/${eventId}`);
  };

  return (
    <Button size="lg" className="w-full" onClick={handleJoin}>
      참여하기
    </Button>
  );
}
