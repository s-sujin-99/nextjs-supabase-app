import { GatherHeader } from "@/components/gather/gather-header";
import { BottomNav } from "@/components/gather/bottom-nav";

export default function GatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <GatherHeader />
      <main className="w-full flex-1 pb-20 sm:pb-8">
        <div className="mx-auto w-full max-w-2xl p-5">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
