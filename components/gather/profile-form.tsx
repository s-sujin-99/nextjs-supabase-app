"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/logout-button";
import type { GatherUser } from "@/lib/types";

function formatJoinedDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoDate));
}

// Task 008: Google OAuth 세션의 실제 사용자 정보로 교체, 이름 수정은 프로필 업데이트 API 연동 예정
export function ProfileForm({ user }: { user: GatherUser }) {
  const [name, setName] = useState(user.name);
  const [savedName, setSavedName] = useState(user.name);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("이름을 입력해주세요");
      return;
    }
    if (trimmed.length > 50) {
      toast.error("이름은 최대 50자까지 입력할 수 있어요");
      return;
    }
    setSavedName(trimmed);
    toast.success("프로필을 저장했어요");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={savedName} />
          <AvatarFallback>{savedName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{savedName}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">이름</Label>
        <div className="flex gap-2">
          <Input
            id="profile-name"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={name.trim() === savedName}
          >
            저장
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>이메일</Label>
        <Input value={user.email} disabled />
      </div>

      <div className="flex flex-col gap-2">
        <Label>가입일</Label>
        <p className="text-sm text-muted-foreground">
          {formatJoinedDate(user.createdAt)}
        </p>
      </div>

      <LogoutButton />
    </div>
  );
}
