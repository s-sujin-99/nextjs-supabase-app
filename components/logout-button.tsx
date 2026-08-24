"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton({
  redirectTo = "/auth/login",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
  };

  return <Button onClick={logout}>Logout</Button>;
}
