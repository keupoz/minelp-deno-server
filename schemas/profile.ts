import { z } from "zod";
import { TexturesSchema } from "./textures.ts";

export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  properties: z.tuple([z.object({
    name: z.literal("textures"),
    value: z.string().transform((value) => {
      const json = JSON.parse(atob(value));

      return TexturesSchema.parse(json);
    }),
    signature: z.optional(z.string()),
  })]),
});
