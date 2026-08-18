import { createClient } from "@/lib/supabase/server";

export type GroupRole = "organizer" | "member";

export type GroupMembership = {
  role: GroupRole;
  userId: string;
};

// 그룹 멤버십 조회 — 페이지 접근 가드와 organizer 전용 UI 노출 판단에 공통으로 사용
export async function getGroupMembership(
  groupId: string,
): Promise<GroupMembership | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return { role: data.role as GroupRole, userId };
}
