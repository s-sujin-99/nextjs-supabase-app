"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseKstDatetimeLocal } from "@/lib/datetime";

const createOfferSchema = z.object({
  groupId: z.string().uuid(),
  eventId: z.string().uuid(),
  departurePoint: z.string().trim().min(1, "출발지를 입력해주세요").max(200),
  departureTime: z.string().min(1, "출발 시간을 선택해주세요"),
  totalSeats: z.coerce
    .number()
    .int()
    .min(1, "좌석 수는 1 이상이어야 합니다")
    .max(20),
  notes: z.string().trim().max(300).optional(),
});

export async function createOfferAction(formData: FormData) {
  const parsed = createOfferSchema.safeParse({
    groupId: formData.get("groupId"),
    eventId: formData.get("eventId"),
    departurePoint: formData.get("departurePoint"),
    departureTime: formData.get("departureTime"),
    totalSeats: formData.get("totalSeats"),
    notes: formData.get("notes") || undefined,
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

  const { error } = await supabase.from("carpool_offers").insert({
    event_id: parsed.data.eventId,
    driver_id: userId,
    departure_point: parsed.data.departurePoint,
    departure_time: parseKstDatetimeLocal(parsed.data.departureTime),
    total_seats: parsed.data.totalSeats,
    notes: parsed.data.notes ?? null,
  });

  if (error) {
    return { error: "카풀을 등록하지 못했습니다" };
  }

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/carpool`,
  );
  return { success: true };
}

const requestSeatSchema = z.object({
  groupId: z.string().uuid(),
  eventId: z.string().uuid(),
  offerId: z.string().uuid(),
});

export async function requestSeatAction(formData: FormData) {
  const parsed = requestSeatSchema.safeParse({
    groupId: formData.get("groupId"),
    eventId: formData.get("eventId"),
    offerId: formData.get("offerId"),
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해주세요" };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) {
    return { error: "로그인이 필요합니다" };
  }

  const { error } = await supabase.from("carpool_requests").insert({
    offer_id: parsed.data.offerId,
    passenger_id: userId,
  });

  if (error) {
    return { error: "이미 신청했거나 신청할 수 없습니다" };
  }

  const { data: offer } = await supabase
    .from("carpool_offers")
    .select("driver_id, departure_point")
    .eq("id", parsed.data.offerId)
    .single();

  if (offer) {
    await supabase.rpc("notify_user", {
      p_user_id: offer.driver_id,
      p_type: "carpool_request",
      p_title: "카풀 탑승 신청이 도착했습니다",
      p_body: `출발지: ${offer.departure_point}`,
      p_link_path: `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/carpool`,
    });
  }

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/carpool`,
  );
  return { success: true };
}

const respondSchema = z.object({
  groupId: z.string().uuid(),
  eventId: z.string().uuid(),
  offerId: z.string().uuid(),
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "declined"]),
});

export async function respondToRequestAction(formData: FormData) {
  const parsed = respondSchema.safeParse({
    groupId: formData.get("groupId"),
    eventId: formData.get("eventId"),
    offerId: formData.get("offerId"),
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해주세요" };
  }

  const supabase = await createClient();

  if (parsed.data.decision === "approved") {
    const [{ data: offer }, { count: approvedCount }] = await Promise.all([
      supabase
        .from("carpool_offers")
        .select("total_seats")
        .eq("id", parsed.data.offerId)
        .single(),
      supabase
        .from("carpool_requests")
        .select("*", { count: "exact", head: true })
        .eq("offer_id", parsed.data.offerId)
        .eq("status", "approved"),
    ]);

    if (offer && (approvedCount ?? 0) >= offer.total_seats) {
      return { error: "남은 좌석이 없습니다" };
    }
  }

  const { data: request, error } = await supabase
    .from("carpool_requests")
    .update({ status: parsed.data.decision })
    .eq("id", parsed.data.requestId)
    .select("passenger_id")
    .single();

  if (error || !request) {
    return { error: "처리하지 못했습니다" };
  }

  await supabase.rpc("notify_user", {
    p_user_id: request.passenger_id,
    p_type:
      parsed.data.decision === "approved"
        ? "carpool_approved"
        : "carpool_declined",
    p_title:
      parsed.data.decision === "approved"
        ? "카풀 탑승 신청이 승인되었습니다"
        : "카풀 탑승 신청이 거절되었습니다",
    p_link_path: `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/carpool`,
  });

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}/carpool`,
  );
  return { success: true };
}
