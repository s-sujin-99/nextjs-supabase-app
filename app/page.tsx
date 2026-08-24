import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Link2, Users, Zap } from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: Zap,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트가 만들어져요.",
  },
  {
    icon: Link2,
    title: "원클릭 초대 링크",
    description: "자동 생성된 초대 링크를 카카오톡으로 바로 공유하세요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "참여자가 들어올 때마다 목록이 실시간으로 업데이트돼요.",
  },
];

const HOW_IT_WORKS = [
  {
    role: "주최자",
    steps: ["이벤트 생성", "초대 링크 공유", "참여자 확인"],
  },
  {
    role: "참여자",
    steps: ["초대 링크 클릭", "로그인", "자동 참여 완료"],
  },
];

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

        <section className="grid w-full max-w-5xl grid-cols-1 gap-4 px-5 sm:grid-cols-3">
          {FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="gap-2">
                <Icon className="size-6 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid w-full max-w-3xl grid-cols-1 gap-8 px-5 sm:grid-cols-2">
          {HOW_IT_WORKS.map(({ role, steps }) => (
            <div key={role} className="flex flex-col gap-3">
              <h2 className="font-semibold">{role} 플로우</h2>
              <ol className="flex flex-col gap-2">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
