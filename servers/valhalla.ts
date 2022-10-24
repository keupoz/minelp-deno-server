import { TexturesSchema } from "../schemas/textures.ts";
import { fetchSkinTexture } from "../utils/skin.ts";
import { template } from "../utils/template.ts";
import { ServerHandler } from "./index.ts";

const URL = template`http://skins.minelittlepony-mod.com/user/${"UUID"}`;

export const VALHALLA_SERVER: ServerHandler = async (uuid) => {
  try {
    const r = await fetch(URL(uuid));
    const json = await r.json();
    const data = TexturesSchema.safeParse(json);

    if (data.success) {
      return await fetchSkinTexture(data.data);
    }

    return { error: data.error };
  } catch (err) {
    return { error: err };
  }
};
