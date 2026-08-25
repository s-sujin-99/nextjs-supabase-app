"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <CardTitle>문제가 발생했어요</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            잠시 후 다시 시도하거나, 문제가 계속되면 홈으로 돌아가주세요.
          </p>
          <Button className="h-12" onClick={reset}>
            다시 시도
          </Button>
          <Button className="h-12" variant="outline" asChild>
            <Link href="/">홈으로 가기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
