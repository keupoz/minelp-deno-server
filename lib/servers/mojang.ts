import { z } from "zod";
import { fetchJson } from "../api/fetchJson.ts";
import { fetchTexture, TexturesObjectSchema } from "../api/fetchTexture.ts";
import { decodeBase64 } from "../utils/decodeBase64.ts";
import { TextureFetcher } from "./types.ts";

export const schema = z.object({
  properties: z.tuple([z.object({
    name: z.literal("textures"),
    value: z.string(),
  })]),
});

export const fetchMojangTexture: TextureFetcher = async (uuid, textureType, signal) => {
  const url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;
  const profile = await fetchJson(url, schema, "NO_PROFILE", signal);
  const texturesObject = await decodeBase64(profile.properties[0].value, TexturesObjectSchema);
  const textureData = await fetchTexture(texturesObject, textureType, signal);

  return textureData;
};
