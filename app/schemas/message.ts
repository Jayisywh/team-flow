import z from "zod";

export const messageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.string().url().optional(),
  threadId: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

export type createMessageSchema = z.infer<typeof messageSchema>;

export type UpdateMessageSchema = z.infer<typeof updateMessageSchema>;
