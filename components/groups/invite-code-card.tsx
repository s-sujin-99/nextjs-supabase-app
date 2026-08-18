"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InviteCodeCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("초대 코드를 복사했습니다");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">초대 코드</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <span className="rounded-md bg-muted px-3 py-1.5 font-mono text-lg tracking-widest">
          {inviteCode}
        </span>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? "복사됨" : "복사"}
        </Button>
      </CardContent>
    </Card>
  );
}
