import z from "zod";

export function transformChannelName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // 1. spaces → dashes
    .replace(/[^a-z0-9-]/g, "") // 2. remove special chars
    .replace(/-+/g, "-") // 3. multiple dashes → one
    .replace(/^-+|-+$/g, ""); // 4. trim dashes
}

export const channelSchema = z.object({
  name: z
    .string()
    .transform(transformChannelName)
    .refine((val) => val.length >= 2, {
      message: "Channel name must be at least 2 characters",
    })
    .refine((val) => val.length <= 50, {
      message: "Channel name must be at most 50 characters",
    }),
});
