import Link from "next/link";
import { BellIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function NotificationBell() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return null;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/notifications">
        <BellIcon className="size-5" />
        {!!count && count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]"
          >
            {count > 9 ? "9+" : count}
          </Badge>
        )}
        <span className="sr-only">알림</span>
      </Link>
    </Button>
  );
}
