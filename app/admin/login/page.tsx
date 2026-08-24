"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("error") === "forbidden"
    ) {
      toast.error("관리자 권한이 없어요");
    }
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
    // signInWithOAuth는 브라우저를 Google 인증 페이지로 이동시키므로
    // 이후 별도 라우팅은 필요 없음
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-4 p-5">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <CardTitle>Gather Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            관리자 계정으로 로그인하면 대시보드로 이동해요.
          </p>
          <Button size="lg" disabled={isLoading} onClick={handleLogin}>
            <GoogleIcon className="size-4" />
            {isLoading ? "이동 중..." : "Google로 로그인"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
