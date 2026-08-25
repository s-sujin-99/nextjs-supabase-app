"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEventAction } from "@/lib/actions/gather-events";

interface EventDetailActionsProps {
  eventId: string;
  eventTitle: string;
  inviteCode: string;
  /** 주최자만 초대 링크 공유/수정/삭제 가능 (F002, F003, F006). 참여자는 읽기 전용 */
  isHost: boolean;
}

export function EventDetailActions({
  eventId,
  eventTitle,
  inviteCode,
  isHost,
}: EventDetailActionsProps) {
  const router = useRouter();
  const invitePath = `/join/${inviteCode}`;
  // 서버 렌더링 시에는 origin을 알 수 없으므로 마운트 후에만 절대 경로로 채운다.
  // (초기 렌더는 항상 상대 경로로 통일해 하이드레이션 불일치를 방지)
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const inviteUrl = `${origin}${invitePath}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("초대 링크를 복사했어요");
  };

  const handleKakaoShare = () => {
    // Task 009: 카카오 SDK 연동 후 실제 공유 카드로 교체 예정
    toast.info("카카오톡 공유는 곧 지원될 예정이에요");
  };

  const handleDelete = async () => {
    const result = await deleteEventAction(eventId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`"${eventTitle}" 이벤트를 삭제했어요`);
    router.push("/events");
  };

  if (!isHost) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="h-12"
          size="sm"
          onClick={handleCopyLink}
        >
          <Copy /> 링크 복사
        </Button>
        <Button
          variant="outline"
          className="h-12"
          size="sm"
          onClick={handleKakaoShare}
        >
          <MessageCircle /> 카카오톡
        </Button>
        <Button variant="outline" className="h-12" size="sm" asChild>
          <a href={`sms:?body=${encodeURIComponent(inviteUrl)}`}>문자 공유</a>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="h-12 flex-1" asChild>
          <Link href={`/events/${eventId}/edit`}>
            <Pencil /> 이벤트 수정
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="h-12 flex-1">
              <Trash2 /> 이벤트 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이벤트를 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                삭제하면 참여자 목록을 포함한 모든 정보가 사라지며 되돌릴 수
                없어요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
