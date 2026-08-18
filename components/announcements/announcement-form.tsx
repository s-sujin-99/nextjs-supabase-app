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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/(dashboard)/groups/[groupId]/announcements/actions";

const NO_EVENT = "none";

const formSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").max(100),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(2000),
  eventId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type EventOption = { id: string; title: string };

export function AnnouncementForm({
  groupId,
  events,
  announcement,
}: {
  groupId: string;
  events: EventOption[];
  announcement?: {
    id: string;
    title: string;
    content: string;
    eventId: string | null;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      eventId: announcement?.eventId ?? NO_EVENT,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("title", values.title);
    formData.set("content", values.content);
    if (values.eventId !== NO_EVENT) {
      formData.set("eventId", values.eventId);
    }

    let result;
    if (announcement) {
      formData.set("announcementId", announcement.id);
      result = await updateAnnouncementAction(formData);
    } else {
      result = await createAnnouncementAction(formData);
    }

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
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="예: 이번 주 모임 안내" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {events.length > 0 && (
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>관련 이벤트 (선택)</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="이벤트를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_EVENT}>연결 안 함</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="공지 내용을 입력해주세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "저장 중..."
            : announcement
              ? "수정하기"
              : "공지 등록"}
        </Button>
      </form>
    </Form>
  );
}
