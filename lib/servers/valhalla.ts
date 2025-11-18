import { fetchJson } from "../api/fetchJson.ts";
import { fetchTexture, TexturesObjectSchema } from "../api/fetchTexture.ts";
import { TextureFetcher } from "./types.ts";

export const fetchValhallaTexture: TextureFetcher = async (uuid, textureType, signal) => {
  const url = `https://skins.minelittlepony-mod.com/api/v1/user/${uuid}`;
  const texturesObject = await fetchJson(url, TexturesObjectSchema, "NO_SKIN", signal);
  const textureData = await fetchTexture(texturesObject, textureType, signal);

  return textureData;
};
