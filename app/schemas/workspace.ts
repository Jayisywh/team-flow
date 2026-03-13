import { z } from "zod";

export const workSpaceSchema = z.object({
  name: z.string().min(2).max(50),
});
