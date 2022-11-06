import { getProfile } from "../utils/profile.ts";
import { template } from "../utils/template.ts";
import { fetchProfileTexture } from "../utils/texture.ts";
import { ServerHandler } from "./index.ts";

const URL =
  template`https://sessionserver.mojang.com/session/minecraft/profile/${"UUID"}`;

export const MOJANG_SERVER: ServerHandler = async (uuid, textureType) => {
  const profile = await getProfile(URL, uuid);

  if ("error" in profile) {
    return { error: profile.error };
  }

  return await fetchProfileTexture(
    profile.response.properties[0].value,
    textureType,
  );
};
