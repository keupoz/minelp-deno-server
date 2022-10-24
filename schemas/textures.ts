import { z } from "zod";

export type TexturesInfo = z.infer<typeof TexturesSchema>;

export const TexturesSchema = z.object({
  timestamp: z.number(),
  profileId: z.string(),
  profileName: z.string(),
  signatureRequired: z.optional(z.boolean()),
  textures: z.object({
    SKIN: z.optional(z.object({
      url: z.string(),
      metadata: z.optional(z.object({
        model: z.string(),
      })),
    })),
    CAPE: z.optional(z.object({
      url: z.string(),
    })),
  }),
});
