import { z } from "zod";

export type TexturesInfo = z.infer<typeof TexturesSchema>;

export const TexturesSchema = z.object({
  timestamp: z.number(),
  profileId: z.string(),
  profileName: z.string(),
  signatureRequired: z.boolean().optional(),
  textures: z.record(
    z.string().transform((value) => value.toLowerCase()),
    z.object({
      url: z.string(),
      metadata: z.record(z.string()).optional(),
    }),
  ),
});
