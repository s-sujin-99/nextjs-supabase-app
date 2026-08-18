"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createEventAction } from "@/app/(dashboard)/groups/[groupId]/events/actions";

const formSchema = z
  .object({
    title: z.string().trim().min(1, "이벤트 제목을 입력해주세요").max(100),
    description: z.string().trim().max(1000).optional(),
    location: z.string().trim().max(200).optional(),
    startsAt: z.string().min(1, "시작 일시를 선택해주세요"),
    endsAt: z.string().optional(),
  })
  .refine((data) => !data.endsAt || data.endsAt >= data.startsAt, {
    message: "종료 일시는 시작 일시 이후여야 합니다",
    path: ["endsAt"],
  });

type FormValues = z.infer<typeof formSchema>;

export function EventForm({ groupId }: { groupId: string }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startsAt: "",
      endsAt: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("title", values.title);
    formData.set("description", values.description ?? "");
    formData.set("location", values.location ?? "");
    formData.set("startsAt", values.startsAt);
    formData.set("endsAt", values.endsAt ?? "");

    const result = await createEventAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 제목</FormLabel>
              <FormControl>
                <Input placeholder="예: 8월 정기 모임" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소 (선택)</FormLabel>
              <FormControl>
                <Input placeholder="예: 올림픽 수영장" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 일시</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>종료 일시 (선택)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea placeholder="이벤트에 대해 설명해주세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "만드는 중..." : "이벤트 만들기"}
        </Button>
      </form>
    </Form>
  );
}
