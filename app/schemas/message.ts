import z from "zod";

export const messageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.string().url().optional(),
});

export type createMessageSchema = z.infer<typeof messageSchema>;
