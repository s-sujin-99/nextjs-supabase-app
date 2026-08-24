import { Suspense } from "react";

import { ProfileForm } from "@/components/gather/profile-form";
import { createClient } from "@/lib/supabase/server";
import type { GatherUser } from "@/lib/types";

async function ProfileContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  const user: GatherUser = {
    id: profile!.id,
    email: profile!.email,
    name: profile!.full_name ?? profile!.email,
    avatarUrl: profile!.avatar_url,
    role: profile!.role === "admin" ? "admin" : "user",
    createdAt: profile!.created_at,
    updatedAt: profile!.updated_at,
  };

  return <ProfileForm user={user} />;
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">프로필</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <ProfileContent />
      </Suspense>
    </div>
  );
}
