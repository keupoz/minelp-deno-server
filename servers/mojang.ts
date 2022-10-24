import { getProfile } from "../utils/profile.ts";
import { fetchSkinTexture, SkinResponse } from "../utils/skin.ts";
import { template } from "../utils/template.ts";
import { ServerHandler } from "./index.ts";

const URL =
  template`https://sessionserver.mojang.com/session/minecraft/profile/${"UUID"}`;

const CACHE = new Map<string, SkinResponse>();

function saveCache(uuid: string, value: SkinResponse): void {
  CACHE.set(uuid, value);

  setTimeout(() => {
    CACHE.delete(uuid);
  }, 60_000);
}

export const MOJANG_SERVER: ServerHandler = async (uuid) => {
  let result = CACHE.get(uuid);

  if (result === undefined) {
    const profile = await getProfile(URL, uuid);

    if ("error" in profile) {
      return { error: profile.error };
    }

    result = await fetchSkinTexture(profile.response.properties[0].value);

    saveCache(uuid, result);
  }

  return result;
};
