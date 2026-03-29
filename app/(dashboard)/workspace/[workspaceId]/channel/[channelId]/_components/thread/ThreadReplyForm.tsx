"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createMessageSchema, messageSchema } from "@/app/schemas/message";
import { useParams } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MessageComposer } from "../message/MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { useEffect, useState } from "react";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { query } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@/lib/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { MessageListItem } from "@/lib/types";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);
  const form = useForm<createMessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [form, threadId]);
  const createMessageMutation = useMutation(
    query.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = query.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });
        type MessagePage = {
          items: Array<MessageListItem>;
          nextCursor?: string;
        };
        type Infinitemessages = InfiniteData<MessagePage>;
        await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
        const previous = queryClient.getQueryData(listOptions.queryKey);
        const optimstic: Message = {
          id: `optimstic:${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? "",
        };
        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            replyMessages: [...old.replyMessages, optimstic],
          };
        });
        queryClient.setQueryData<Infinitemessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === threadId ? { ...m, replyCount: m.replyCount + 1 } : m,
              ),
            }));
            return {
              ...old,
              pages,
            };
          },
        );
        return { listOptions, previous };
      },
      onSuccess: (_data, _variable, _context) => {
        queryClient.invalidateQueries({
          queryKey: _context.listOptions.queryKey,
        });
        form.reset({
          channelId,
          content: "",
          threadId: threadId ?? "",
        });
        upload.clear();
        setEditorKey((k) => k + 1);
        return toast.success("Message created successfully");
      },
      onError: (_error, _variable, context) => {
        if (!context) return;
        const { listOptions, previous } = context;
        if (previous) {
          queryClient.setQueryData(listOptions.queryKey, previous);
        }
        return toast.error(_error.message);
      },
    }),
  );
  const onSubmit = (data: createMessageSchema) => {
    console.log(data);
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  value={field.value}
                  onChange={field.onChange}
                  upload={upload}
                  key={editorKey}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
