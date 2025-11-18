import { z } from "zod";
import { TextureData } from "../servers/types.ts";
import { APIError } from "./APIError.ts";
import { strictFetch } from "./strictFetch.ts";

export type TexturesObject = z.infer<typeof TexturesObjectSchema>;

export const TexturesObjectSchema = z.object({
  textures: z.record(
    z.string().transform((value) => value.toLowerCase()),
    z.object({
      url: z.string(),
      metadata: z.record(z.string(), z.string()).optional(),
    }),
  ),
});

export async function fetchTexture(
  { textures }: TexturesObject,
  textureType: string,
  signal?: AbortSignal,
): Promise<TextureData> {
  const texture = textures[textureType];

  if (!texture) throw new APIError("NO_SKIN");

  const response = await strictFetch(texture.url, "INTERNAL_ERROR", signal);
  const value = await response.arrayBuffer();

  return {
    value,
    model: texture.metadata?.model,
  };
}
