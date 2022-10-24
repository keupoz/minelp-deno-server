import { z } from "zod";

export type UUIDInfo = z.infer<typeof UUIDInfoSchema>;

export const UUIDInfoSchema = z.object({
  name: z.string(),
  id: z.string(),
});
