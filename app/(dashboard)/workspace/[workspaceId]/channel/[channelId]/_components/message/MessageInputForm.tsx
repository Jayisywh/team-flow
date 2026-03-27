"use client";

import { createMessageSchema, messageSchema } from "@/app/schemas/message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MessageComposer } from "./MessageComposer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { query } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";

interface MessageInputFormProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

type MessagePage = { items: Message[]; nextCursor?: string };
type InfiniteMessages = InfiniteData<MessagePage>;

export function MessageInputForm({ channelId, user }: MessageInputFormProps) {
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();
  const upload = useAttachmentUpload();
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
    },
  });
  const createMessageMutation = useMutation(
    query.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });
        const previousData = queryClient.getQueryData<InfiniteMessages>([
          "message.list",
          channelId,
        ]);
        const tempId = `optimistic-${crypto.randomUUID()}`;
        const optimisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: channelId,
        };
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) {
              return {
                pages: [
                  {
                    items: [optimisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies InfiniteMessages;
            }
            const firstPage = oldData.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };
            const updatedFirstPage: MessagePage = {
              ...firstPage,
              items: [optimisticMessage, ...firstPage.items],
            };
            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          },
        );
        return {
          previousData,
          tempId,
        };
      },
      onSuccess: (data, _variable, context) => {
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) return oldData;
            const updatedPages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((message) =>
                message.id === context.tempId ? { ...data } : message,
              ),
            }));
            return {
              ...oldData,
              pages: updatedPages,
            };
          },
        );
        form.reset({ channelId, content: "" });
        upload.clear();
        setEditorKey((key) => key + 1);
        return toast.success("Created message successfully");
      },
      onError: (_err, _variable, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["message.list", channelId],
            context.previousData,
          );
        }
        return toast.error("Something went wrong");
      },
    }),
  );
  function onSubmit(data: createMessageSchema) {
    console.log(data);
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  }
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
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
      </form>
    </Form>
  );
}
