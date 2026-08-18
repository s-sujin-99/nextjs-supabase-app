"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GroupNav({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const base = `/groups/${groupId}`;
  const items = [
    { href: base, label: "홈" },
    { href: `${base}/announcements`, label: "공지" },
    { href: `${base}/events`, label: "이벤트" },
    { href: `${base}/members`, label: "멤버" },
  ];

  return (
    <nav className="flex gap-1 border-b">
      {items.map((item) => {
        const isActive =
          item.href === base
            ? pathname === base
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
