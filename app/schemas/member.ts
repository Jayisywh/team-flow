import z from "zod";

export const inviteMemberSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be at most 20 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
