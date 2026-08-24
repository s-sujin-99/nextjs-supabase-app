"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Task 008: Google OAuth 로그인 + role 체크(role !== "admin" 접근 거부) 연동 예정
export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    toast.success("관리자로 로그인했어요");
    router.push("/admin/dashboard");
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
          <Button size="lg" onClick={handleLogin}>
            Google로 로그인
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
