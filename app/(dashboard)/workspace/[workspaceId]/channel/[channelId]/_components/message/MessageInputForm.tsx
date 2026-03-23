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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/orpc";
import { toast } from "sonner";

interface MessageInputFormProps {
  channelId: string;
}

export function MessageInputForm({ channelId }: MessageInputFormProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
    },
  });
  const createMessageMutation = useMutation(
    query.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: query.message.list.key({}),
        });
        toast.success("Message created successfully");
        form.reset();
      },
      onError: () => {
        toast.error("Failed to create a message");
      },
    }),
  );
  function onSubmit(data: createMessageSchema) {
    console.log(data);
    createMessageMutation.mutate(data);
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
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={createMessageMutation.isPending}
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
