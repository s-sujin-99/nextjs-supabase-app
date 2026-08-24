// Task 008: 관리자 전용 로그인 플로우(role: admin 검증) 구현 예정
export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-4 p-5 text-center">
      <h1 className="text-2xl font-semibold">관리자 로그인</h1>
      <p className="text-sm text-muted-foreground">
        관리자 계정으로 로그인하는 폼이 여기에 표시됩니다.
      </p>
    </main>
  );
}
