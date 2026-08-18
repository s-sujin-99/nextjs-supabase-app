"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { splitEqually } from "@/lib/settlements/split";

const shareInputSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().int().min(0),
});

const createSettlementSchema = z
  .object({
    groupId: z.string().uuid(),
    eventId: z.string().uuid(),
    totalAmount: z.coerce.number().int().min(1, "총 금액을 입력해주세요"),
    splitMethod: z.enum(["equal", "custom"]),
    bankName: z.string().trim().min(1, "은행명을 입력해주세요").max(50),
    accountNumber: z.string().trim().min(1, "계좌번호를 입력해주세요").max(50),
    accountHolder: z.string().trim().min(1, "예금주를 입력해주세요").max(50),
    shares: z.array(shareInputSchema).min(1, "정산에 포함할 인원이 없습니다"),
  })
  .refine(
    (data) =>
      data.splitMethod !== "custom" ||
      data.shares.reduce((sum, share) => sum + share.amount, 0) ===
        data.totalAmount,
    { message: "분배 금액의 합이 총 금액과 일치해야 합니다", path: ["shares"] },
  );

export async function createSettlementAction(formData: FormData) {
  const rawShares = formData.get("shares");
  let parsedShares: unknown = [];
  if (typeof rawShares === "string") {
    try {
      parsedShares = JSON.parse(rawShares);
    } catch {
      return { error: "입력값을 확인해주세요" };
    }
  }

  const parsed = createSettlementSchema.safeParse({
    groupId: formData.get("groupId"),
    eventId: formData.get("eventId"),
    totalAmount: formData.get("totalAmount"),
    splitMethod: formData.get("splitMethod"),
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
    accountHolder: formData.get("accountHolder"),
    shares: parsedShares,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요",
    };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) {
    return { error: "로그인이 필요합니다" };
  }

  const memberIds = parsed.data.shares.map((share) => share.userId);
  const amounts =
    parsed.data.splitMethod === "equal"
      ? splitEqually(parsed.data.totalAmount, memberIds.length)
      : parsed.data.shares.map((share) => share.amount);

  const { data: settlement, error: settlementError } = await supabase
    .from("settlements")
    .insert({
      event_id: parsed.data.eventId,
      created_by: userId,
      total_amount: parsed.data.totalAmount,
      split_method: parsed.data.splitMethod,
      bank_name: parsed.data.bankName,
      account_number: parsed.data.accountNumber,
      account_holder: parsed.data.accountHolder,
    })
    .select("id")
    .single();

  if (settlementError || !settlement) {
    return { error: "정산을 생성하지 못했습니다" };
  }

  const { error: sharesError } = await supabase
    .from("settlement_shares")
    .insert(
      memberIds.map((memberUserId, index) => ({
        settlement_id: settlement.id,
        user_id: memberUserId,
        amount: amounts[index],
      })),
    );

  if (sharesError) {
    return { error: "분배 내역을 저장하지 못했습니다" };
  }

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/settlement`,
  );
  return { success: true };
}

const markPaidSchema = z.object({
  groupId: z.string().uuid(),
  eventId: z.string().uuid(),
  shareId: z.string().uuid(),
  isPaid: z.enum(["true", "false"]),
});

export async function markSharePaidAction(formData: FormData) {
  const parsed = markPaidSchema.safeParse({
    groupId: formData.get("groupId"),
    eventId: formData.get("eventId"),
    shareId: formData.get("shareId"),
    isPaid: formData.get("isPaid"),
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해주세요" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_settlement_share_paid", {
    p_share_id: parsed.data.shareId,
    p_is_paid: parsed.data.isPaid === "true",
  });

  if (error) {
    return { error: "처리하지 못했습니다" };
  }

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/settlement`,
  );
  return { success: true };
}
