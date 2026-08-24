import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

// Task 004: 서비스 소개/기능 안내 콘텐츠(F001) 보강 예정
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <Link href="/" className="font-semibold">
              Gather
            </Link>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex max-w-2xl flex-1 flex-col items-center gap-6 p-5 text-center">
          <h1 className="text-4xl font-bold">
            초대 링크 하나로 끝내는 이벤트 관리
          </h1>
          <p className="text-lg text-muted-foreground">
            생일 파티, 워크샵, 세미나 같은 소규모 이벤트를 만들고, 초대 링크로
            참여자를 모아보세요.
          </p>
          <Button asChild size="lg">
            <Link href="/events/new">새 이벤트 만들기</Link>
          </Button>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
