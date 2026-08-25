"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { ImagePlus } from "lucide-react";

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
  createEventAction,
  updateEventAction,
} from "@/lib/actions/gather-events";
import { parseKstDatetimeLocal, toKstDateKey } from "@/lib/datetime";

const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "이벤트 제목을 입력해주세요")
    .max(50, "제목은 최대 50자까지 입력할 수 있어요"),
  description: z
    .string()
    .trim()
    .max(500, "설명은 최대 500자까지 입력할 수 있어요")
    .optional(),
  eventDate: z.string().min(1, "이벤트 날짜와 시간을 선택해주세요"),
  location: z
    .string()
    .trim()
    .min(1, "장소를 입력해주세요")
    .max(100, "장소는 최대 100자까지 입력할 수 있어요"),
});

// 새 이벤트는 지난 날짜로 만들 수 없다. 기존 이벤트 수정 시에는 다른 필드만
// 고치면서 이미 지난 날짜를 그대로 유지하는 경우가 흔하므로 이 제약을 적용하지 않는다.
const createEventFormSchema = eventFormSchema.refine(
  (data) => {
    const todayKey = toKstDateKey(new Date());
    const eventKey = toKstDateKey(new Date(`${data.eventDate}:00+09:00`));
    return eventKey >= todayKey;
  },
  { message: "지난 날짜는 선택할 수 없어요", path: ["eventDate"] },
);

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: Partial<EventFormValues>;
  defaultCoverImageUrl?: string | null;
}

export function EventForm({
  mode,
  eventId,
  defaultValues,
  defaultCoverImageUrl,
}: EventFormProps) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultCoverImageUrl ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(
      mode === "create" ? createEventFormSchema : eventFormSchema,
    ),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      location: "",
      ...defaultValues,
    },
  });

  const handleCoverChange = (file: File | undefined) => {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: EventFormValues) => {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description ?? "");
    formData.set("eventDate", parseKstDatetimeLocal(values.eventDate));
    formData.set("location", values.location);
    if (coverFile) {
      formData.set("cover", coverFile);
    }

    const result =
      mode === "create"
        ? await createEventAction(formData)
        : await updateEventAction(eventId!, formData);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === "create"
        ? `"${values.title}" 이벤트가 생성되었어요`
        : "이벤트 정보를 수정했어요",
    );
    router.push(`/events/${result.eventId}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">커버 이미지 (선택)</label>
          <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground hover:bg-muted/60">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="커버 이미지 미리보기"
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <>
                <ImagePlus className="size-6" />
                이미지를 선택해주세요
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverChange(e.target.files?.[0])}
            />
          </label>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 제목</FormLabel>
              <FormControl>
                <Input placeholder="예: 지우 생일 파티" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>날짜 및 시간</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
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
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input placeholder="예: 서울 마포구 연남동 파티룸" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대해 참여자에게 알려주세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="h-12"
          disabled={form.formState.isSubmitting}
        >
          {mode === "create" ? "이벤트 생성" : "수정 완료"}
        </Button>
      </form>
    </Form>
  );
}
